'use client';

interface SpecificationTableProps {
  specifications: Record<string, string>;
}

export function SpecificationTable({ specifications }: SpecificationTableProps) {
  const entries = Object.entries(specifications);

  if (entries.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">暂无规格参数</div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <tbody>
          {entries.map(([key, value], index) => (
            <tr
              key={key}
              className={index % 2 === 0 ? 'bg-muted/50' : 'bg-background'}
            >
              <td className="px-4 py-3 text-sm font-medium text-muted-foreground w-1/3">
                {key}
              </td>
              <td className="px-4 py-3 text-sm">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
