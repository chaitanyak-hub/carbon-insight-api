import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, ChevronDown } from "lucide-react";
import { SiteRecord, formatAgentName } from "@/utils/chartHelpers";
import * as XLSX from 'xlsx';
import { useState } from "react";

interface SiteStatisticsTableProps {
  data: SiteRecord[];
}

const SiteStatisticsTable = ({ data }: SiteStatisticsTableProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Helper function to format date as DD/MM/YYYY
  const formatDateDDMMYYYY = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to extract MPAN from elecMeter object
  const extractMPAN = (record: any): string => {
    if (record.elecMeter && typeof record.elecMeter === 'object') {
      const mpans = Object.keys(record.elecMeter);
      return mpans.length > 0 ? mpans.join(', ') : 'N/A';
    }
    return 'N/A';
  };

  // Helper function to extract MPRN from gasMeter object
  const extractMPRN = (record: any): string => {
    if (record.gasMeter && typeof record.gasMeter === 'object') {
      const mprns = Object.keys(record.gasMeter);
      return mprns.length > 0 ? mprns.join(', ') : 'N/A';
    }
    return 'N/A';
  };

  // Transform data for site statistics table
  const tableData = data.map(record => ({
    address: record.siteAddress || record.display_name || 'N/A',
    agentName: formatAgentName(record.agent_name || 'Unknown'),
    siteAddedDate: record.onboard_date || '',
    siteStatus: record.site_status || 'N/A',
    mpan: extractMPAN(record),
    mprn: extractMPRN(record),
    companyName: record.company_name || 'N/A',
  }));

  // Sort by site added date (most recent first)
  tableData.sort((a, b) => {
    if (!a.siteAddedDate) return 1;
    if (!b.siteAddedDate) return -1;
    return new Date(b.siteAddedDate).getTime() - new Date(a.siteAddedDate).getTime();
  });

  // Function to export to Excel
  const exportToExcel = () => {
    const exportData = tableData.map(row => ({
      'Address': row.address,
      'Agent Name': row.agentName,
      'Site Added Date': formatDateDDMMYYYY(row.siteAddedDate),
      'Site Status': row.siteStatus,
      'MPAN': row.mpan,
      'MPRN': row.mprn,
      'Company Name': row.companyName,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Site Statistics');
    
    const fileName = `Site_Statistics_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="p-0 hover:bg-transparent">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">
                      Site Statistics
                    </CardTitle>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CardDescription>
                Detailed information about all sites including address, agent, status, and MPAN
              </CardDescription>
            </div>
            <Button 
              onClick={exportToExcel} 
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Address</TableHead>
                    <TableHead className="font-bold">Agent Name</TableHead>
                    <TableHead className="font-bold">Site Added Date</TableHead>
                    <TableHead className="font-bold">Site Status</TableHead>
                    <TableHead className="font-bold">MPAN</TableHead>
                    <TableHead className="font-bold">MPRN</TableHead>
                    <TableHead className="font-bold">Company Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    tableData.map((row, index) => (
                      <TableRow key={`${row.mpan}-${index}`}>
                        <TableCell className="font-medium">{row.address}</TableCell>
                        <TableCell>{row.agentName}</TableCell>
                        <TableCell>{formatDateDDMMYYYY(row.siteAddedDate)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            row.siteStatus === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {row.siteStatus}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{row.mpan}</TableCell>
                        <TableCell className="font-mono text-sm">{row.mprn}</TableCell>
                        <TableCell>{row.companyName}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default SiteStatisticsTable;
