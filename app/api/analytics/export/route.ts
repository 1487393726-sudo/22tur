import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { reportType, format, period } = await request.json()

    let data = []
    let filename = ''

    switch (reportType) {
      case 'projects':
        data = await getProjectsData()
        filename = `projects-report-${new Date().toISOString().split('T')[0]}`
        break
      case 'employees':
        data = await getEmployeesData()
        filename = `employees-report-${new Date().toISOString().split('T')[0]}`
        break
      case 'clients':
        data = await getClientsData()
        filename = `clients-report-${new Date().toISOString().split('T')[0]}`
        break
      default:
        return NextResponse.json(
          { error: '不支持的报告类型' },
          { status: 400 }
        )
    }

    // 根据格式返回数据
    if (format === 'json') {
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`
        }
      })
    } else if (format === 'csv') {
      const csvData = convertToCSV(data)
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      })
    } else {
      return NextResponse.json(
        { error: '不支持的格式' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('导出报告失败:', error)
    return NextResponse.json(
      { error: '导出报告失败' },
      { status: 500 }
    )
  }
}

async function getProjectsData() {
  const projects = await prisma.project.findMany({
    include: {
      client: true,
      members: {
        include: {
          user: true
        }
      }
    }
  })

  return projects.map(project => ({
    name: project.name,
    status: project.status,
    priority: project.priority,
    client: project.client?.name || '未分配',
    members: project.members.map(m => m.user.firstName + ' ' + m.user.lastName).join(', '),
    budget: project.budget,
    startDate: project.startDate,
    endDate: project.endDate
  }))
}

async function getEmployeesData() {
  const employees = await prisma.user.findMany({
    where: {
      role: {
        in: ['EMPLOYEE', 'MANAGER']
      }
    },
    include: {
      department: true
    }
  })

  return employees.map(employee => ({
    name: `${employee.firstName} ${employee.lastName}`,
    email: employee.email,
    role: employee.role,
    position: employee.position,
    department: employee.department?.name || '未分配',
    status: employee.status,
    hireDate: employee.hireDate
  }))
}

async function getClientsData() {
  const clients = await prisma.client.findMany({
    include: {
      projects: {
        select: {
          status: true
        }
      }
    }
  })

  return clients.map(client => ({
    name: client.name,
    email: client.email,
    phone: client.phone,
    company: client.company,
    industry: client.industry,
    status: client.status,
    projectCount: client.projects.length,
    createdAt: client.createdAt
  }))
}

function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return ''
  }

  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')

  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header]
      // 处理包含逗号的值，用引号包围
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ''
    }).join(',')
  })

  return [csvHeaders, ...csvRows].join('\n')
}