"use client";

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, Share2, Grid, List, FileText, Archive, Image, Video, FileJson, FolderOpen } from 'lucide-react';
import { PageHeader } from "@/components/dashboard/page-header";
import { dashboardStyles } from "@/lib/dashboard-styles";
import { useDashboardTranslations } from "@/lib/i18n/use-dashboard-translations";
import { cn } from "@/lib/utils";

const files = [
  { id: 'file-001', name: 'logo_final_assets.zip', type: 'ZIP', size: '15.8 MB', orderId: 'ORD-001', date: '2023-10-28' },
  { id: 'file-002', name: 'brand-guidelines.pdf', type: 'PDF', size: '2.3 MB', orderId: 'ORD-001', date: '2023-10-28' },
  { id: 'file-003', name: 'logo-transparent-bg.png', type: 'PNG', size: '512 KB', orderId: 'ORD-001', date: '2023-10-28' },
  { id: 'file-004', name: 'marketing-video-4k.mp4', type: 'MP4', size: '1.2 GB', orderId: 'ORD-005', date: '2023-12-01' },
  { id: 'file-005', name: 'product-model.3d', type: '3D', size: '128 MB', orderId: 'ORD-006', date: '2024-01-10' },
  { id: 'file-006', name: 'website-icons.svg', type: 'SVG', size: '89 KB', orderId: 'ORD-007', date: '2024-01-20' },
];

const fileTypeIcons: { [key: string]: React.ElementType } = {
  'PDF': FileText, 'ZIP': Archive, 'PNG': Image, 'MP4': Video, '3D': FileJson, 'SVG': FileJson,
};

export default function FilesPage() {
  const { t, isRTL } = useDashboardTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fileTypes = ['all', ...Array.from(new Set(files.map(f => f.type)))];

  const filteredFiles = files.filter(file => {
    const matchType = filterType === 'all' || file.type === filterType;
    const matchSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <PageHeader
        title={t("files.title", "File Library")}
        description={t("files.description", "Centrally manage all final files delivered from your projects")}
        icon="📁"
      />

      <Tabs defaultValue="grid">
        <div className={cn("flex flex-col md:flex-row justify-between items-start md:items-center gap-4", isRTL && "md:flex-row-reverse")}>
          <div className={cn("flex flex-col md:flex-row gap-4 flex-1", isRTL && "md:flex-row-reverse")}>
            <div className="relative w-full md:w-auto md:flex-1">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                placeholder={t("files.searchPlaceholder", "Search file name...")}
                className={cn(isRTL ? "pr-10" : "pl-10")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]" aria-label={t("files.filterType", "Filter file type")}>
                <SelectValue placeholder={t("files.filterType", "Filter file type")} />
              </SelectTrigger>
              <SelectContent>
                {fileTypes.map(type => (
                  <SelectItem key={type} value={type}>{type === 'all' ? t("files.allFiles", "All") : type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <TabsList className="grid grid-cols-2 w-full md:w-auto mt-4 md:mt-0">
            <TabsTrigger value="grid"><Grid className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")}/>Grid View</TabsTrigger>
            <TabsTrigger value="list"><List className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")}/>List View</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFiles.map(file => {
              const Icon = fileTypeIcons[file.type] || FileText;
              return (
                <Card key={file.id} className={`overflow-hidden ${dashboardStyles.card.base}`}>
                  <CardHeader className="p-0 aspect-video bg-muted flex items-center justify-center">
                    <Icon className="h-16 w-16 text-muted-foreground/50" />
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-base font-semibold truncate" title={file.name}>{file.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{file.size}</p>
                  </CardContent>
                  <CardFooter className={cn("px-4 pb-4 flex gap-2", isRTL ? "justify-start" : "justify-end")}>
                    <Button variant="ghost" size="icon"><Share2 className="h-4 w-4"/></Button>
                    <Button variant="default" size="sm"><Download className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")}/>Download</Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="list" className="mt-6">
          <Card className={dashboardStyles.card.base}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[40px]'></TableHead>
                  <TableHead>{t("files.fileName", "File Name")}</TableHead>
                  <TableHead>{t("files.size", "Size")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("files.sourceOrder", "Source Order")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("files.deliveryDate", "Delivery Date")}</TableHead>
                  <TableHead className={cn(isRTL ? "text-left" : "text-right")}>{t("files.actions", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map(file => {
                  const Icon = fileTypeIcons[file.type] || FileText;
                  return (
                    <TableRow key={file.id}>
                      <TableCell><Icon className="h-5 w-5 text-muted-foreground"/></TableCell>
                      <TableCell className="font-medium">{file.name}</TableCell>
                      <TableCell>{file.size}</TableCell>
                      <TableCell className="hidden md:table-cell">{file.orderId}</TableCell>
                      <TableCell className="hidden md:table-cell">{file.date}</TableCell>
                      <TableCell className={cn(isRTL ? "text-left" : "text-right")}>
                        <Button variant="ghost" size="icon"><Download className="h-4 w-4"/></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
      {filteredFiles.length === 0 && (
        <div className="text-center py-24">
          <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t("files.noFilesFound", "No matching files found")}</p>
        </div>
      )}
    </div>
  );
}
