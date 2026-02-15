"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Upload,
  Eye,
  Calendar,
  FileText,
  Folder,
  Filter,
  Grid,
  List,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Document {
  id: string;
  title: string;
  category: string;
  type: string;
  size: string;
  uploadDate: string;
  downloadCount: number;
  version: string;
  description: string;
  author: string;
  status: "active" | "archived" | "draft";
}

const DocumentManagement = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", name: "全部文档", count: 0 },
    { id: "contract", name: "合同文档", count: 0 },
    { id: "technical", name: "技术文档", count: 0 },
    { id: "financial", name: "财务文档", count: 0 },
    { id: "report", name: "报告文档", count: 0 },
    { id: "training", name: "培训资料", count: 0 },
    { id: "legal", name: "法务文件", count: 0 },
  ];

  const documentTypes = [
    { type: "pdf", icon: "📄", color: "bg-red-100 text-red-700" },
    { type: "doc", icon: "📝", color: "bg-blue-100 text-blue-700" },
    { type: "xls", icon: "📊", color: "bg-green-100 text-green-700" },
    { type: "ppt", icon: "📋", color: "bg-orange-100 text-orange-700" },
    { type: "zip", icon: "📦", color: "bg-purple-100 text-purple-700" },
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const mockDocuments: Document[] = [
        {
          id: "1",
          title: "2024年度服务合同模板",
          category: "contract",
          type: "doc",
          size: "2.5 MB",
          uploadDate: "2024-11-15",
          downloadCount: 156,
          version: "v2.1",
          description: "标准服务合同模板，适用于各类服务项目",
          author: "法务部",
          status: "active",
        },
        {
          id: "2",
          title: "系统架构设计文档",
          category: "technical",
          type: "pdf",
          size: "8.3 MB",
          uploadDate: "2024-11-10",
          downloadCount: 89,
          version: "v3.0",
          description: "企业管理系统技术架构详细设计",
          author: "技术部",
          status: "active",
        },
        {
          id: "3",
          title: "Q3财务分析报告",
          category: "financial",
          type: "xls",
          size: "1.2 MB",
          uploadDate: "2024-11-08",
          downloadCount: 67,
          version: "v1.0",
          description: "第三季度财务数据分析和趋势预测",
          author: "财务部",
          status: "active",
        },
        {
          id: "4",
          title: "项目管理培训资料",
          category: "training",
          type: "ppt",
          size: "15.6 MB",
          uploadDate: "2024-11-05",
          downloadCount: 134,
          version: "v1.2",
          description: "项目管理最佳实践培训课程材料",
          author: "人力资源部",
          status: "active",
        },
        {
          id: "5",
          title: "客户服务SOP手册",
          category: "report",
          type: "pdf",
          size: "3.8 MB",
          uploadDate: "2024-11-01",
          downloadCount: 201,
          version: "v4.0",
          description: "客户服务标准作业程序指导手册",
          author: "客服部",
          status: "active",
        },
        {
          id: "6",
          title: "法律合规指南",
          category: "legal",
          type: "pdf",
          size: "5.1 MB",
          uploadDate: "2024-10-28",
          downloadCount: 78,
          version: "v1.5",
          description: "企业经营法律合规操作指南",
          author: "法务部",
          status: "active",
        },
        {
          id: "7",
          title: "项目实施计划模板",
          category: "contract",
          type: "doc",
          size: "1.8 MB",
          uploadDate: "2024-10-25",
          downloadCount: 145,
          version: "v2.3",
          description: "标准项目实施计划制定模板",
          author: "项目管理部",
          status: "active",
        },
        {
          id: "8",
          title: "数据库设计规范",
          category: "technical",
          type: "pdf",
          size: "4.2 MB",
          uploadDate: "2024-10-20",
          downloadCount: 92,
          version: "v2.0",
          description: "企业数据库设计标准和规范文档",
          author: "技术部",
          status: "draft",
        },
      ];

      // 更新分类计数
      const updatedCategories = categories.map((cat) => {
        if (cat.id === "all") {
          return { ...cat, count: mockDocuments.length };
        }
        return {
          ...cat,
          count: mockDocuments.filter((doc) => doc.category === cat.id).length,
        };
      });

      setDocuments(mockDocuments);
      setLoading(false);
    } catch (error) {
      console.error("获取文档失败:", error);
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || doc.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || doc.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getFileTypeInfo = (type: string) => {
    return documentTypes.find((t) => t.type === type) || documentTypes[0];
  };

  const handleDownload = async (documentId: string) => {
    try {
      // 这里应该调用实际的下载API
      const document = documents.find((doc) => doc.id === documentId);
      if (document) {
        // 模拟下载
        console.log("下载文档:", document.title);
        // 增加下载次数
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === documentId
              ? { ...doc, downloadCount: doc.downloadCount + 1 }
              : doc,
          ),
        );
      }
    } catch (error) {
      console.error("下载失败:", error);
    }
  };

  const handleUpload = () => {
    // 这里应该打开文件上传对话框
    console.log("打开文件上传");
  };

  const DocumentCard = ({ document }: { document: Document }) => {
    const fileInfo = getFileTypeInfo(document.type);
    const statusColors = {
      active: "bg-green-500/30 text-green-200 border-green-400/30",
      draft: "bg-yellow-500/30 text-yellow-200 border-yellow-400/30",
      archived: "bg-gray-500/30 text-gray-200 border-gray-400/30",
    };

    return (
      <Card
        className="group hover:shadow-lg transition-all duration-300 p-6 hover:scale-[1.02] bg-white/10 border-white/20 backdrop-blur-sm"
        data-oid="pblq0rh"
      >
        <div
          className="flex items-start justify-between mb-4"
          data-oid="_uu3sl6"
        >
          <div
            className={`p-3 rounded-lg ${fileInfo.color} bg-white/10 border border-white/20`}
            data-oid="9tk9q1b"
          >
            <span className="text-2xl" data-oid="qcamne8">
              {fileInfo.icon}
            </span>
          </div>
          <div className="flex items-center gap-2" data-oid="d6dcgzn">
            <Badge className={statusColors[document.status]} data-oid="1jrfzu:">
              {document.status === "active"
                ? "生效"
                : document.status === "draft"
                  ? "草稿"
                  : "归档"}
            </Badge>
            <span
              className="text-xs text-gray-400 font-medium"
              data-oid="c.jmipc"
            >
              {document.version}
            </span>
          </div>
        </div>

        <div className="space-y-3" data-oid="e-qveh2">
          <div data-oid="96k-7t5">
            <h3
              className="font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-1"
              data-oid="9w3mbg4"
            >
              {document.title}
            </h3>
            <p
              className="text-sm text-gray-300 mt-1 line-clamp-2"
              data-oid="php9fcl"
            >
              {document.description}
            </p>
          </div>

          <div
            className="flex items-center justify-between text-xs text-gray-400"
            data-oid="zy49lxt"
          >
            <div className="flex items-center gap-4" data-oid="_75m-ja">
              <span data-oid="b5fywmy">{document.size}</span>
              <span data-oid="hs_4yfi">{document.downloadCount} 次下载</span>
            </div>
            <span data-oid="1xmox:f">{document.uploadDate}</span>
          </div>

          <div
            className="flex items-center justify-between pt-3 border-t border-white/10"
            data-oid="nyzr_2_"
          >
            <div className="text-xs text-gray-300" data-oid="74xbjko">
              <div data-oid="u2u2brg">作者: {document.author}</div>
            </div>
            <div className="flex items-center gap-2" data-oid="kqwvmel">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-white/10 text-blue-300"
                data-oid="zq3oiag"
              >
                <Eye className="h-4 w-4" data-oid="x:rlcal" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-white/10 text-green-300"
                onClick={() => handleDownload(document.id)}
                data-oid="ixabbv1"
              >
                <Download className="h-4 w-4" data-oid="hl:lj98" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6"
        data-oid="xn_cotj"
      >
        <div className="max-w-7xl mx-auto" data-oid="w.lc3st">
          <div className="animate-pulse" data-oid="0.5rb-c">
            <div
              className="h-8 bg-white/10 rounded w-1/3 mb-6"
              data-oid="n_6u9u."
            ></div>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              data-oid="b2f79ql"
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-white/10 rounded-xl"
                  data-oid="mz7bqvs"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6"
      data-oid="a30wha-"
    >
      <div className="max-w-7xl mx-auto space-y-6" data-oid="j2nw3q:">
        {/* 页面标题 */}
        <div className="flex items-center justify-between" data-oid="fe6kzud">
          <div data-oid="_eddlqk">
            <h1 className="text-3xl font-bold text-white" data-oid="uwwh0z-">
              文档资料管理
            </h1>
            <p className="text-gray-300 mt-2" data-oid="ywdtgoa">
              管理企业文档、资料下载和版本控制
            </p>
          </div>
          <Button
            onClick={handleUpload}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            data-oid="mjvc0z1"
          >
            <Upload className="h-4 w-4 mr-2" data-oid="k05xg7v" />
            上传文档
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <Card
          className="p-6 bg-white/10 border-white/20 backdrop-blur-sm"
          data-oid="so..3yq"
        >
          <div className="flex flex-col lg:flex-row gap-4" data-oid="t:--mrc">
            <div className="flex-1 relative" data-oid="x_i:f_.">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300"
                data-oid="pnpnck_"
              />
              <Input
                placeholder="搜索文档名称或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                data-oid="5t48-bb"
              />
            </div>

            <div className="flex gap-2" data-oid="9dcmuj-">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white text-sm"
                data-oid="8uq614."
              >
                <option value="all" data-oid="5l6fdax">
                  全部状态
                </option>
                <option value="active" data-oid="2wxch58">
                  生效
                </option>
                <option value="draft" data-oid="gz-hspt">
                  草稿
                </option>
                <option value="archived" data-oid="8.svkxl">
                  归档
                </option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                className="p-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                data-oid="hqu0_jo"
              >
                {viewMode === "grid" ? (
                  <List className="h-4 w-4" data-oid="op7e5ld" />
                ) : (
                  <Grid className="h-4 w-4" data-oid="gdegnzr" />
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* 分类标签 */}
        <Card
          className="p-6 bg-white/10 backdrop-blur-sm border border-white/20"
          data-oid="2dx8e_a"
        >
          <div className="flex items-center gap-2 flex-wrap" data-oid="0tqlwg2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
                data-oid="j7fe4ll"
              >
                {category.name}
                <span
                  className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs"
                  data-oid="ado3i.l"
                >
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* 统计信息 */}
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          data-oid="vt3kpc1"
        >
          <Card
            className="p-4 bg-white/10 backdrop-blur-sm border border-white/20"
            data-oid="c4r8dsu"
          >
            <div
              className="flex items-center justify-between"
              data-oid="o71zul4"
            >
              <div data-oid=":m3c9ne">
                <p className="text-sm text-gray-300" data-oid="syjatpg">
                  总文档数
                </p>
                <p className="text-2xl font-bold text-white" data-oid="-50r825">
                  {documents.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" data-oid="y6vvtx9" />
            </div>
          </Card>

          <Card
            className="p-4 bg-white/10 backdrop-blur-sm border border-white/20"
            data-oid="u4csyc-"
          >
            <div
              className="flex items center justify-between"
              data-oid="km9g3p2"
            >
              <div data-oid="q0oeped">
                <p className="text-sm text-gray-300" data-oid="h2nbyy4">
                  本月新增
                </p>
                <p
                  className="text-2xl font-bold text-green-300"
                  data-oid="gyxp:q9"
                >
                  12
                </p>
              </div>
              <Upload className="h-8 w-8 text-green-400" data-oid=".lvs7p1" />
            </div>
          </Card>

          <Card
            className="p-4 bg-white/10 backdrop-blur-sm border border-white/20"
            data-oid="-2fsety"
          >
            <div
              className="flex items-center justify-between"
              data-oid="k367mks"
            >
              <div data-oid="ep1p._g">
                <p className="text-sm text-gray-300" data-oid="oz8pxqq">
                  总下载次数
                </p>
                <p
                  className="text-2xl font-bold text-purple-300"
                  data-oid="quhrqmq"
                >
                  {documents.reduce((sum, doc) => sum + doc.downloadCount, 0)}
                </p>
              </div>
              <Download
                className="h-8 w-8 text-purple-400"
                data-oid="b_-95-x"
              />
            </div>
          </Card>

          <Card
            className="p-4 bg-white/10 backdrop-blur-sm border border-white/20"
            data-oid="3w-j3wj"
          >
            <div
              className="flex items-center justify-between"
              data-oid="t.09s2:"
            >
              <div data-oid="1wcq-ci">
                <p className="text-sm text-gray-300" data-oid="f7-r7pz">
                  存储空间
                </p>
                <p
                  className="text-2xl font-bold text-orange-300"
                  data-oid="bvxwr82"
                >
                  126 MB
                </p>
              </div>
              <Folder className="h-8 w-8 text-orange-400" data-oid="reknkk:" />
            </div>
          </Card>
        </div>

        {/* 文档列表 */}
        <div className="space-y-4" data-oid="45zs78t">
          <div className="flex items-center justify-between" data-oid="enpn:m3">
            <h2 className="text-xl font-semibold text-white" data-oid=":doibc6">
              文档列表 ({filteredDocuments.length} 个)
            </h2>
          </div>

          {filteredDocuments.length === 0 ? (
            <Card
              className="p-12 text-center bg-white/10 backdrop-blur-sm border border-white/20"
              data-oid="acxbq0n"
            >
              <FileText
                className="h-12 w-12 text-gray-300 mx-auto mb-4"
                data-oid="f-qo:dh"
              />
              <h3
                className="text-lg font-medium text-white mb-2"
                data-oid="l0tm9ma"
              >
                暂无文档
              </h3>
              <p className="text-gray-300 mb-4" data-oid="1fud45g">
                还没有上传任何文档，点击上方按钮开始上传
              </p>
              <Button
                onClick={handleUpload}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/20"
                data-oid=":7638yd"
              >
                <Upload className="h-4 w-4 mr-2" data-oid="f9c7btj" />
                上传第一个文档
              </Button>
            </Card>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
              data-oid="7:4fu2_"
            >
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  data-oid="q:i2va2"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement;
