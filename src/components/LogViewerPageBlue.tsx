import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Search,
  Download,
  Filter,
  Terminal,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  Calendar
} from 'lucide-react';
import { mockLogs } from '../lib/mock-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';

export function LogViewerPageBlue() {
  const [logs, setLogs] = useState(mockLogs);
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<typeof mockLogs[0] | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesSearch = searchQuery === '' || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.sessionId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'debug':
        return <Terminal className="h-4 w-4 text-gray-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const styles: Record<string, string> = {
      info: 'bg-blue-100 text-blue-700 border-blue-200 border',
      debug: 'bg-gray-100 text-gray-700 border-gray-200 border',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-200 border',
      error: 'bg-red-100 text-red-700 border-red-200 border'
    };
    const labels: Record<string, string> = {
      info: 'INFO',
      debug: 'DEBUG',
      warning: 'WARNING',
      error: 'ERROR'
    };
    return <Badge className={styles[level] || styles.info}>{labels[level] || 'INFO'}</Badge>;
  };

  return (
    <div className="space-y-6 bg-gray-50/30 -m-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 font-bold text-[24px]">로그 조회</h1>
          <p className="text-gray-600 mt-1 text-sm">
            시스템 로그를 상세하게 조회하고 필터링합니다
          </p>
        </div>
        <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
          <Download className="h-4 w-4 mr-2" />
          로그 다운로드
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-blue-100 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Filter className="h-5 w-5" />
            필터 및 검색
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">검색</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  className="pl-9"
                  placeholder="메시지 또는 세션 ID 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">로그 레벨</Label>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="info">INFO</SelectItem>
                  <SelectItem value="debug">DEBUG</SelectItem>
                  <SelectItem value="warning">WARNING</SelectItem>
                  <SelectItem value="error">ERROR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">날짜 범위</Label>
              <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              총 {filteredLogs.length}개의 로그 항목
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setFilterLevel('all');
                setSearchQuery('');
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              필터 초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log Table */}
      <Card className="border-blue-100 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Terminal className="h-5 w-5" />
            로그 목록
          </CardTitle>
          <CardDescription className="text-gray-600">클릭하여 상세 정보를 확인하세요</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <ScrollArea className="h-[600px]">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 bg-gray-50">
                    <TableHead className="w-[50px] text-gray-700">레벨</TableHead>
                    <TableHead className="w-[180px] text-gray-700">시간</TableHead>
                    <TableHead className="w-[150px] text-gray-700">세션 ID</TableHead>
                    <TableHead className="text-gray-700">메시지</TableHead>
                    <TableHead className="w-[100px] text-gray-700">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        필터 조건에 맞는 로그가 없습니다
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map(log => (
                      <TableRow 
                        key={log.id} 
                        className="cursor-pointer hover:bg-blue-50 border-gray-200"
                        onClick={() => setSelectedLog(log)}
                      >
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {getLevelIcon(log.level)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-600 text-sm">
                              {new Date(log.timestamp).toLocaleString('ko-KR')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">
                            {log.sessionId}
                          </code>
                        </TableCell>
                        <TableCell className="text-gray-900">{log.message}</TableCell>
                        <TableCell>
                          {getLevelBadge(log.level)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Log Details Panel */}
      {selectedLog && (
        <Card className="border-blue-100 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-gray-900">로그 상세 정보</CardTitle>
            <CardDescription className="text-gray-600">선택한 로그의 상세 내용</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>로그 ID</Label>
                <p className="text-gray-900">{selectedLog.id}</p>
              </div>
              <div className="space-y-2">
                <Label>레벨</Label>
                <div>{getLevelBadge(selectedLog.level)}</div>
              </div>
              <div className="space-y-2">
                <Label>타임스탬프</Label>
                <p className="text-gray-900">
                  {new Date(selectedLog.timestamp).toLocaleString('ko-KR')}
                </p>
              </div>
              <div className="space-y-2">
                <Label>세션 ID</Label>
                <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">
                  {selectedLog.sessionId}
                </code>
              </div>
            </div>

            <div className="space-y-2">
              <Label>메시지</Label>
              <p className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900">{selectedLog.message}</p>
            </div>

            {selectedLog.details && (
              <div className="space-y-2">
                <Label>상세 정보</Label>
                <pre className="p-4 bg-gray-50 border border-gray-200 rounded-md overflow-x-auto">
                  <code className="text-gray-900 text-sm">{selectedLog.details}</code>
                </pre>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedLog(null)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                닫기
              </Button>
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <Download className="h-4 w-4 mr-2" />
                이 로그 다운로드
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
