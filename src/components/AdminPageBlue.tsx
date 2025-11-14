import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  Plus, Server, Database as DatabaseIcon, Cpu, Users as UsersIcon, Key, Activity, HardDrive, FileText,
  Eye, Save, X, Info, Search, Filter, Trash2, ChevronLeft, ChevronRight, Shield, AlertTriangle,
  Copy, CheckCircle2, Calendar, EyeOff, Upload, Download, Mail, User as UserIcon
} from 'lucide-react';
import { mockModels, mockVectorDBs, mockSystemStatus } from '../lib/mock-data';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { toast } from 'sonner@2.0.3';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';

interface AdminPageBlueProps {
  onViewLogs: () => void;
}

interface APIKey {
  id: string;
  name: string;
  description: string;
  key: string;
  permission: 'read' | 'full';
  createdAt: string;
  expiresAt?: string;
  lastUsed?: string;
  status: 'active' | 'expired' | 'revoked';
}

interface BaseDataset {
  id: string;
  name: string;
  description: string;
  type: 'QA' | 'Retrieval' | 'Summarization' | 'Classification';
  itemCount: number;
  createdAt: string;
  status: 'active' | 'inactive';
  format: 'JSON' | 'CSV';
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

export function AdminPageBlue({ onViewLogs }: AdminPageBlueProps) {
  const [models, setModels] = useState(mockModels);
  const [vectorDBs, setVectorDBs] = useState(mockVectorDBs);
  const [showHelpBanner, setShowHelpBanner] = useState(true);
  
  // 검색 및 필터 상태
  const [modelSearch, setModelSearch] = useState('');
  const [modelStatusFilter, setModelStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [vectorDBSearch, setVectorDBSearch] = useState('');
  const [vectorDBStatusFilter, setVectorDBStatusFilter] = useState<'all' | 'connected' | 'disconnected'>('all');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [apiKeySearch, setApiKeySearch] = useState('');
  const [apiKeyStatusFilter, setApiKeyStatusFilter] = useState<'all' | 'active' | 'expired' | 'revoked'>('all');
  const [datasetSearch, setDatasetSearch] = useState('');
  const [datasetTypeFilter, setDatasetTypeFilter] = useState<'all' | 'QA' | 'Retrieval' | 'Summarization' | 'Classification'>('all');
  
  // 페이지네이션
  const [modelPage, setModelPage] = useState(1);
  const [vectorDBPage, setVectorDBPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [apiKeyPage, setApiKeyPage] = useState(1);
  const [datasetPage, setDatasetPage] = useState(1);
  const itemsPerPage = 5;
  
  // Dialog 상태
  const [editingModel, setEditingModel] = useState<typeof mockModels[0] | null>(null);
  const [isEditModelDialogOpen, setIsEditModelDialogOpen] = useState(false);
  const [isAddModelDialogOpen, setIsAddModelDialogOpen] = useState(false);
  const [editingVectorDB, setEditingVectorDB] = useState<typeof mockVectorDBs[0] | null>(null);
  const [isEditVectorDBDialogOpen, setIsEditVectorDBDialogOpen] = useState(false);
  const [isAddVectorDBDialogOpen, setIsAddVectorDBDialogOpen] = useState(false);
  const [isCreateAPIKeyDialogOpen, setIsCreateAPIKeyDialogOpen] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [isCreateDatasetDialogOpen, setIsCreateDatasetDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  
  // Form 상태
  const [modelForm, setModelForm] = useState({
    name: '', provider: '', type: 'cloud' as 'cloud' | 'on-premise',
    status: 'active' as 'active' | 'inactive', apiKey: '', endpoint: ''
  });

  const [vectorDBForm, setVectorDBForm] = useState({
    name: '', type: 'Pinecone', status: 'connected' as 'connected' | 'disconnected',
    apiKey: '', endpoint: '', index: ''
  });

  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    { id: 'key-1', name: 'Production API', description: '운영 환경 평가 자동화용',
      key: 'ex_live_sk_1a2b3c4d5e6f7g8h', permission: 'full', createdAt: '2025-01-10',
      lastUsed: '2025-01-15', status: 'active' },
    { id: 'key-2', name: 'Development API', description: '개발 환경 테스트용',
      key: 'ex_test_sk_9i8h7g6f5e4d3c2b', permission: 'read', createdAt: '2025-01-05',
      expiresAt: '2025-07-05', lastUsed: '2025-01-14', status: 'active' }
  ]);

  const [apiKeyForm, setApiKeyForm] = useState({
    name: '', description: '', permission: 'read' as 'read' | 'full',
    hasExpiration: false, expiresAt: ''
  });

  const [baseDatasets, setBaseDatasets] = useState<BaseDataset[]>([
    { id: 'ds-1', name: 'MS MARCO QA', description: 'Microsoft Machine Reading Comprehension 데이터셋',
      type: 'QA', itemCount: 1000, createdAt: '2025-01-01', status: 'active', format: 'JSON' },
    { id: 'ds-2', name: 'Natural Questions', description: 'Google Natural Questions 벤치마크',
      type: 'QA', itemCount: 500, createdAt: '2025-01-05', status: 'active', format: 'JSON' },
    { id: 'ds-3', name: 'HotpotQA', description: '다중 문서 추론 QA 데이터셋',
      type: 'Retrieval', itemCount: 800, createdAt: '2025-01-10', status: 'inactive', format: 'CSV' }
  ]);

  const [datasetForm, setDatasetForm] = useState({
    name: '', description: '', type: 'QA' as 'QA' | 'Retrieval' | 'Summarization' | 'Classification',
    format: 'JSON' as 'JSON' | 'CSV', file: null as File | null
  });

  const [users, setUsers] = useState<User[]>([
    { id: 'user-1', name: '홍길동', email: 'hong@example.com', role: 'admin',
      status: 'active', createdAt: '2024-12-01', lastLogin: '2025-01-16' },
    { id: 'user-2', name: '박찬식', email: 'kim@example.com', role: 'user',
      status: 'active', createdAt: '2024-12-15', lastLogin: '2025-01-15' },
    { id: 'user-3', name: '이영희', email: 'lee@example.com', role: 'user',
      status: 'active', createdAt: '2025-01-05', lastLogin: '2025-01-14' },
    { id: 'user-4', name: '최민수', email: 'choi@example.com', role: 'user',
      status: 'inactive', createdAt: '2024-11-20', lastLogin: '2024-12-30' }
  ]);

  const [userForm, setUserForm] = useState({
    name: '', email: '', role: 'user' as 'admin' | 'user', password: ''
  });

  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // 필터링
  const filteredModels = models.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
                         m.provider.toLowerCase().includes(modelSearch.toLowerCase());
    const matchesStatus = modelStatusFilter === 'all' || m.status === modelStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredVectorDBs = vectorDBs.filter(db => {
    const matchesSearch = db.name.toLowerCase().includes(vectorDBSearch.toLowerCase()) ||
                         db.type.toLowerCase().includes(vectorDBSearch.toLowerCase());
    const matchesStatus = vectorDBStatusFilter === 'all' || db.status === vectorDBStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredAPIKeys = apiKeys.filter(key => {
    const matchesSearch = key.name.toLowerCase().includes(apiKeySearch.toLowerCase()) ||
                         key.description.toLowerCase().includes(apiKeySearch.toLowerCase());
    const matchesStatus = apiKeyStatusFilter === 'all' || key.status === apiKeyStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDatasets = baseDatasets.filter(ds => {
    const matchesSearch = ds.name.toLowerCase().includes(datasetSearch.toLowerCase()) ||
                         ds.description.toLowerCase().includes(datasetSearch.toLowerCase());
    const matchesType = datasetTypeFilter === 'all' || ds.type === datasetTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // 페이지네이션
  const paginatedModels = filteredModels.slice((modelPage - 1) * itemsPerPage, modelPage * itemsPerPage);
  const modelTotalPages = Math.ceil(filteredModels.length / itemsPerPage);
  const paginatedVectorDBs = filteredVectorDBs.slice((vectorDBPage - 1) * itemsPerPage, vectorDBPage * itemsPerPage);
  const vectorDBTotalPages = Math.ceil(filteredVectorDBs.length / itemsPerPage);
  const paginatedAPIKeys = filteredAPIKeys.slice((apiKeyPage - 1) * itemsPerPage, apiKeyPage * itemsPerPage);
  const apiKeyTotalPages = Math.ceil(filteredAPIKeys.length / itemsPerPage);
  const paginatedDatasets = filteredDatasets.slice((datasetPage - 1) * itemsPerPage, datasetPage * itemsPerPage);
  const datasetTotalPages = Math.ceil(filteredDatasets.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);
  const userTotalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // 통계
  const activeModels = models.filter(m => m.status === 'active').length;
  const connectedVectorDBs = vectorDBs.filter(db => db.status === 'connected').length;
  const activeAPIKeys = apiKeys.filter(k => k.status === 'active').length;
  const activeDatasets = baseDatasets.filter(ds => ds.status === 'active').length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const regularUsers = users.filter(u => u.role === 'user').length;
  const activeUsers = users.filter(u => u.status === 'active').length;

  // 핸들러
  const handleOpenAddModel = () => {
    setModelForm({
      name: '',
      provider: '',
      type: 'cloud',
      status: 'active',
      apiKey: '',
      endpoint: ''
    });
    setIsAddModelDialogOpen(true);
  };

  const handleAddModel = () => {
    if (!modelForm.name.trim()) {
      toast.error('모델명을 입력해주세요');
      return;
    }
    if (!modelForm.provider.trim()) {
      toast.error('제공사를 입력해주세요');
      return;
    }
    if (!modelForm.apiKey.trim()) {
      toast.error('API 키를 입력해주세요');
      return;
    }
    if (modelForm.type === 'on-premise' && !modelForm.endpoint.trim()) {
      toast.error('엔드포인트를 입력해주세요');
      return;
    }

    const newModel = {
      id: `model-${Date.now()}`,
      name: modelForm.name,
      provider: modelForm.provider,
      type: modelForm.type,
      status: modelForm.status
    };

    setModels([...models, newModel]);
    setIsAddModelDialogOpen(false);
    toast.success('LLM 모델이 추가되었습니다');
  };

  const handleEditModel = (model: typeof mockModels[0]) => {
    setEditingModel(model);
    setModelForm({ name: model.name, provider: model.provider, type: model.type, status: model.status,
      apiKey: '****************************', endpoint: model.type === 'on-premise' ? 'http://localhost:8000' : '' });
    setIsEditModelDialogOpen(true);
  };

  const handleSaveModel = () => {
    if (!editingModel) return;
    setModels(models.map(m => m.id === editingModel.id 
      ? { ...m, name: modelForm.name, provider: modelForm.provider, type: modelForm.type, status: modelForm.status } : m));
    setIsEditModelDialogOpen(false);
    setEditingModel(null);
    toast.success('LLM 모델이 수정되었습니다');
  };

  const handleDeleteModel = (id: string, name: string) => {
    if (confirm(`"${name}" 모델을 삭제하시겠습니까?`)) {
      setModels(models.filter(m => m.id !== id));
      toast.success('LLM 모델이 삭제되었습니다');
    }
  };

  const handleEditVectorDB = (db: typeof mockVectorDBs[0]) => {
    setEditingVectorDB(db);
    setVectorDBForm({ name: db.name, type: db.type, status: db.status, apiKey: '****************************',
      endpoint: 'https://api.vectordb.example.com', index: 'default-index' });
    setIsEditVectorDBDialogOpen(true);
  };

  const handleSaveVectorDB = () => {
    if (!editingVectorDB) return;
    setVectorDBs(vectorDBs.map(db => db.id === editingVectorDB.id 
      ? { ...db, name: vectorDBForm.name, type: vectorDBForm.type, status: vectorDBForm.status } : db));
    setIsEditVectorDBDialogOpen(false);
    setEditingVectorDB(null);
    toast.success('Vector DB가 수정되었습니다');
  };

  const handleAddVectorDB = () => {
    if (!vectorDBForm.name.trim()) {
      toast.error('DB 이름을 입력해주세요');
      return;
    }
    setVectorDBs([...vectorDBs, { id: `db-${Date.now()}`, name: vectorDBForm.name, 
      type: vectorDBForm.type, status: vectorDBForm.status }]);
    setIsAddVectorDBDialogOpen(false);
    toast.success('Vector DB가 추가되었습니다');
  };

  const handleDeleteVectorDB = (id: string, name: string) => {
    if (confirm(`"${name}" DB를 삭제하시겠습니까?`)) {
      setVectorDBs(vectorDBs.filter(db => db.id !== id));
      toast.success('Vector DB가 삭제되었습니다');
    }
  };

  const handleCreateAPIKey = () => {
    if (!apiKeyForm.name.trim()) {
      toast.error('API 키 이름을 입력해주세요');
      return;
    }
    const generatedKey = `ex_${apiKeyForm.permission}_sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKeys([{ id: `key-${Date.now()}`, name: apiKeyForm.name, description: apiKeyForm.description,
      key: generatedKey, permission: apiKeyForm.permission, createdAt: new Date().toISOString().split('T')[0],
      expiresAt: apiKeyForm.hasExpiration ? apiKeyForm.expiresAt : undefined, status: 'active' }, ...apiKeys]);
    setNewlyCreatedKey(generatedKey);
    toast.success('API 키가 생성되었습니다');
  };

  const handleCloseCreateDialog = () => {
    setIsCreateAPIKeyDialogOpen(false);
    setNewlyCreatedKey(null);
    setApiKeyForm({
      name: '',
      description: '',
      permission: 'read',
      hasExpiration: false,
      expiresAt: ''
    });
  };

  const handleCopyAPIKey = async (keyId: string, keyValue: string) => {
    try {
      await navigator.clipboard.writeText(keyValue);
      setCopiedKeyId(keyId);
      toast.success('API 키가 클립보드에 복사되었습니다');
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch (error) {
      // Clipboard API가 차단된 경우 fallback
      console.warn('Clipboard API blocked:', error);
      
      // 텍스트를 선택 가능하도록 임시 input 생성
      const textArea = document.createElement('textarea');
      textArea.value = keyValue;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopiedKeyId(keyId);
        toast.success('API 키가 클립보드에 복사되었습니다');
        setTimeout(() => setCopiedKeyId(null), 2000);
      } catch (err) {
        toast.error('클립보드 복사에 실패했습니다. 수동으로 복사해주세요.');
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const handleRevokeAPIKey = (id: string, name: string) => {
    if (confirm(`"${name}" API 키를 무효화하시겠습니까?`)) {
      setApiKeys(apiKeys.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k));
      toast.success('API 키가 무효화되었습니다');
    }
  };

  const handleCreateDataset = () => {
    if (!datasetForm.name.trim() || !datasetForm.file) {
      toast.error('필수 항목을 입력해주세요');
      return;
    }
    setBaseDatasets([{ id: `ds-${Date.now()}`, name: datasetForm.name, description: datasetForm.description,
      type: datasetForm.type, itemCount: Math.floor(Math.random() * 1000) + 100,
      createdAt: new Date().toISOString().split('T')[0], status: 'active', format: datasetForm.format }, ...baseDatasets]);
    setIsCreateDatasetDialogOpen(false);
    setDatasetForm({ name: '', description: '', type: 'QA', format: 'JSON', file: null });
    toast.success('데이터셋이 추가되었습니다');
  };

  const handleDeleteDataset = (id: string, name: string) => {
    if (confirm(`"${name}" 데이터셋을 삭제하시겠습니까?`)) {
      setBaseDatasets(baseDatasets.filter(ds => ds.id !== id));
      toast.success('데이터셋이 삭제되었습니다');
    }
  };

  const handleToggleDatasetStatus = (id: string) => {
    setBaseDatasets(baseDatasets.map(ds => ds.id === id 
      ? { ...ds, status: ds.status === 'active' ? 'inactive' as const : 'active' as const } : ds));
    toast.success('데이터셋 상태가 변경되었습니다');
  };

  const handleCreateUser = () => {
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.password || userForm.password.length < 8) {
      toast.error('필수 항목을 입력해주세요');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userForm.email)) {
      toast.error('올바른 이메일 형식을 입력해주세요');
      return;
    }
    if (users.some(u => u.email === userForm.email)) {
      toast.error('이미 등록된 이메��입니다');
      return;
    }
    setUsers([{ id: `user-${Date.now()}`, name: userForm.name, email: userForm.email, role: userForm.role,
      status: 'active', createdAt: new Date().toISOString().split('T')[0] }, ...users]);
    setIsCreateUserDialogOpen(false);
    setUserForm({ name: '', email: '', role: 'user', password: '' });
    toast.success('사용자가 추가되었습니다');
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, role: user.role, password: '' });
    setIsEditUserDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!editingUser) return;
    if (!userForm.name.trim() || !userForm.email.trim()) {
      toast.error('필수 항목을 입력해주세요');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userForm.email)) {
      toast.error('올바른 이메일 형식을 입력해주세요');
      return;
    }
    if (users.some(u => u.id !== editingUser.id && u.email === userForm.email)) {
      toast.error('이미 등록된 이메일입니다');
      return;
    }
    setUsers(users.map(u => u.id === editingUser.id 
      ? { ...u, name: userForm.name, email: userForm.email, role: userForm.role } : u));
    setIsEditUserDialogOpen(false);
    setEditingUser(null);
    toast.success('사용자 정보가 수정되었습니다');
  };

  const handleDeleteUser = (id: string, name: string) => {
    const user = users.find(u => u.id === id);
    if (user?.role === 'admin' && adminUsers === 1) {
      toast.error('마지막 관리자는 삭제할 수 없습니다');
      return;
    }
    if (confirm(`"${name}" 사용자를 삭제하시겠습니까?`)) {
      setUsers(users.filter(u => u.id !== id));
      toast.success('사용자가 삭제되었습니다');
    }
  };

  const handleToggleUserStatus = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user?.role === 'admin' && user.status === 'active' && activeUsers === 1) {
      toast.error('마지막 활성 관리자는 비활성화할 수 없습니다');
      return;
    }
    setUsers(users.map(u => u.id === id 
      ? { ...u, status: u.status === 'active' ? 'inactive' as const : 'active' as const } : u));
    toast.success('사용자 상태가 변경되었습니다');
  };

  const maskAPIKey = (key: string) => {
    if (key.length <= 12) return '••••••••••••';
    return key.substring(0, 12) + '••••••••••••';
  };

  const Pagination = ({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">페이지 {page} / {totalPages}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1} className="border-gray-300">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages} className="border-gray-300">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 bg-gray-50/30 -m-6 p-6">
        {showHelpBanner && (
          <Alert className="border-amber-200 bg-amber-50">
            <Shield className="h-4 w-4 text-amber-600" />
            <AlertDescription className="flex items-start justify-between gap-2">
              <span className="text-sm text-amber-900">
                <strong>관리자 권한 안내:</strong> 시스템 설정 변경은 진행 중인 평가에 영향을 줄 수 있습니다.
              </span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-amber-100 shrink-0"
                onClick={() => setShowHelpBanner(false)}>
                <X className="h-4 w-4 text-amber-600" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div>
          <h1 className="text-gray-900 font-bold text-[24px]">관리자 대시보드</h1>
          <p className="text-gray-600 mt-1 text-sm">시스템 리소스 및 사용자를 관리합니다</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-blue-100 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Server className="h-5 w-5" />
                시스템 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">API 서버</span>
                <Badge className="bg-green-100 text-green-700 border-green-200 border">정상</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">데이터베이스</span>
                <Badge className="bg-green-100 text-green-700 border-green-200 border">연결됨</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">API 엔드포인트</span>
                <code className="text-blue-600 text-sm">https://api.rag-eval.com</code>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Activity className="h-5 w-5" />
                리소스 사용량
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">CPU</span>
                  <span className="text-gray-900 font-medium">{mockSystemStatus.cpuUsage}%</span>
                </div>
                <Progress value={mockSystemStatus.cpuUsage} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">메모리</span>
                  <span className="text-gray-900 font-medium">{mockSystemStatus.memoryUsage}%</span>
                </div>
                <Progress value={mockSystemStatus.memoryUsage} />
              </div>
              <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50" onClick={onViewLogs}>
                <FileText className="h-4 w-4 mr-2" />
                상세 로그 조회
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="models" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="models">LLM 모델</TabsTrigger>
            <TabsTrigger value="vectordb">Vector DB</TabsTrigger>
            <TabsTrigger value="datasets">기본 데이터셋</TabsTrigger>
            <TabsTrigger value="users">사용자</TabsTrigger>
            <TabsTrigger value="apikeys">API 키</TabsTrigger>
          </TabsList>

          {/* LLM Models Tab */}
          <TabsContent value="models">
            <Card className="border-blue-100 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">
                <div>
                  <CardTitle className="text-gray-900">LLM 모델 관리</CardTitle>
                  <CardDescription className="text-gray-600">시스템에서 사용 가능한 LLM 모델을 관리합니다</CardDescription>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleOpenAddModel}>
                  <Plus className="h-4 w-4 mr-2" />모델 추가
                </Button>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-4 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Cpu className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600">전체</span>
                    <span className="font-semibold text-gray-900">{models.length}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">활성</span>
                    <span className="font-semibold text-gray-900">{activeModels}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input placeholder="모델명 또는 제공사 검색..." value={modelSearch}
                      onChange={(e) => { setModelSearch(e.target.value); setModelPage(1); }}
                      className="pl-9 h-9 text-sm border-gray-300" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select value={modelStatusFilter} onValueChange={(value: any) => { setModelStatusFilter(value); setModelPage(1); }}>
                      <SelectTrigger className="w-32 h-9 text-sm border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체 상태</SelectItem>
                        <SelectItem value="active">활성</SelectItem>
                        <SelectItem value="inactive">비활성</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {paginatedModels.length > 0 ? (
                  <>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-200 bg-gray-50">
                            <TableHead className="text-gray-700">모델명</TableHead>
                            <TableHead className="text-gray-700">제공사</TableHead>
                            <TableHead className="text-gray-700">유형</TableHead>
                            <TableHead className="text-gray-700">상태</TableHead>
                            <TableHead className="text-gray-700">작업</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedModels.map(model => (
                            <TableRow key={model.id} className="border-gray-200">
                              <TableCell className="text-gray-900">{model.name}</TableCell>
                              <TableCell className="text-gray-900">{model.provider}</TableCell>
                              <TableCell>
                                <Badge className={model.type === 'cloud' 
                                  ? 'bg-blue-100 text-blue-700 border-blue-200 border' 
                                  : 'bg-purple-100 text-purple-700 border-purple-200 border'}>
                                  {model.type === 'cloud' ? '클라우드' : '온프레미스'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={model.status === 'active' 
                                  ? 'bg-green-100 text-green-700 border-green-200 border' 
                                  : 'bg-gray-100 text-gray-700 border-gray-200 border'}>
                                  {model.status === 'active' ? '활성' : '비활성'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50"
                                    onClick={() => handleEditModel(model)}>수정</Button>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50"
                                    onClick={() => handleDeleteModel(model.id, model.name)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <Pagination page={modelPage} totalPages={modelTotalPages} onPageChange={setModelPage} />
                  </>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-12 text-center">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">검색 결과가 없습니다</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isAddModelDialogOpen} onOpenChange={setIsAddModelDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">LLM 모델 추가</DialogTitle>
                  <DialogDescription className="text-gray-600">새로운 LLM 모델을 추가합니다</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-model-name">모델명 <span className="text-red-500">*</span></Label>
                    <Input id="add-model-name" value={modelForm.name}
                      onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                      placeholder="GPT-4" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-model-provider">제공사 <span className="text-red-500">*</span></Label>
                    <Select value={modelForm.provider || ''} onValueChange={(val) => setModelForm({ ...modelForm, provider: val })}>
                      <SelectTrigger id="add-model-provider">
                        <SelectValue placeholder="제공사 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OpenAI">OpenAI</SelectItem>
                        <SelectItem value="Anthropic">Anthropic</SelectItem>
                        <SelectItem value="Google">Google</SelectItem>
                        <SelectItem value="Cohere">Cohere</SelectItem>
                        <SelectItem value="Hugging Face">Hugging Face</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-model-type">모델 유형</Label>
                    <Select value={modelForm.type} onValueChange={(val: any) => setModelForm({ ...modelForm, type: val })}>
                      <SelectTrigger id="add-model-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cloud">클라우드 (API 기반)</SelectItem>
                        <SelectItem value="on-premise">온프레미스 (자체 호스팅)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-model-apikey">API 키 <span className="text-red-500">*</span></Label>
                    <Input id="add-model-apikey" type="password" value={modelForm.apiKey}
                      onChange={(e) => setModelForm({ ...modelForm, apiKey: e.target.value })}
                      placeholder="sk-..." />
                    <p className="text-xs text-gray-500">API 키는 암호화되어 저장됩니다</p>
                  </div>
                  {modelForm.type === 'on-premise' && (
                    <div className="space-y-2">
                      <Label htmlFor="add-model-endpoint">엔드포인트 <span className="text-red-500">*</span></Label>
                      <Input id="add-model-endpoint" value={modelForm.endpoint}
                        onChange={(e) => setModelForm({ ...modelForm, endpoint: e.target.value })}
                        placeholder="http://localhost:8000" />
                    </div>
                  )}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex gap-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-blue-900">모델 추가 안내</p>
                        <ul className="text-xs text-blue-800 space-y-1">
                          <li>• API 키는 각 제공사에서 발급받은 키를 입력하세요</li>
                          <li>• 온프레미스 모델은 자체 호스팅 서버의 엔드포인트를 지정하세요</li>
                          <li>• 추가된 모델은 즉시 평가에 사용할 수 있습니다</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setIsAddModelDialogOpen(false)} className="gap-2">
                    <X className="h-4 w-4" />취소
                  </Button>
                  <Button onClick={handleAddModel} className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Plus className="h-4 w-4" />추가
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditModelDialogOpen} onOpenChange={setIsEditModelDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">LLM 모델 수정</DialogTitle>
                  <DialogDescription className="text-gray-600">모델 정보를 수정합니다</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="model-name">모델명 <span className="text-red-500">*</span></Label>
                    <Input id="model-name" value={modelForm.name}
                      onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model-provider">제공사 <span className="text-red-500">*</span></Label>
                    <Input id="model-provider" value={modelForm.provider}
                      onChange={(e) => setModelForm({ ...modelForm, provider: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model-status">상태</Label>
                    <Select value={modelForm.status} onValueChange={(val: any) => setModelForm({ ...modelForm, status: val })}>
                      <SelectTrigger id="model-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">활성</SelectItem>
                        <SelectItem value="inactive">비활성</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setIsEditModelDialogOpen(false)} className="gap-2">
                    <X className="h-4 w-4" />취소
                  </Button>
                  <Button onClick={handleSaveModel} className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Save className="h-4 w-4" />저장
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Vector DB Tab */}
          <TabsContent value="vectordb">
            <Card className="border-blue-100 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">
                <div>
                  <CardTitle className="text-gray-900">Vector Database 관리</CardTitle>
                  <CardDescription className="text-gray-600">벡터 데이터베이스 연결을 관리합니다</CardDescription>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddVectorDBDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />DB 추가
                </Button>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-4 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-1.5 text-sm">
                    <DatabaseIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600">전체</span>
                    <span className="font-semibold text-gray-900">{vectorDBs.length}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">연결됨</span>
                    <span className="font-semibold text-gray-900">{connectedVectorDBs}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input placeholder="DB명 또는 유형 검색..." value={vectorDBSearch}
                      onChange={(e) => { setVectorDBSearch(e.target.value); setVectorDBPage(1); }}
                      className="pl-9 h-9 text-sm border-gray-300" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select value={vectorDBStatusFilter} onValueChange={(value: any) => { setVectorDBStatusFilter(value); setVectorDBPage(1); }}>
                      <SelectTrigger className="w-32 h-9 text-sm border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체 상태</SelectItem>
                        <SelectItem value="connected">연결됨</SelectItem>
                        <SelectItem value="disconnected">연결 끊김</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {paginatedVectorDBs.length > 0 ? (
                  <>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-200 bg-gray-50">
                            <TableHead className="text-gray-700">DB명</TableHead>
                            <TableHead className="text-gray-700">유형</TableHead>
                            <TableHead className="text-gray-700">상태</TableHead>
                            <TableHead className="text-gray-700">작업</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedVectorDBs.map(db => (
                            <TableRow key={db.id} className="border-gray-200">
                              <TableCell className="text-gray-900">{db.name}</TableCell>
                              <TableCell className="text-gray-900">{db.type}</TableCell>
                              <TableCell>
                                <Badge className={db.status === 'connected' 
                                  ? 'bg-green-100 text-green-700 border-green-200 border' 
                                  : 'bg-red-100 text-red-700 border-red-200 border'}>
                                  {db.status === 'connected' ? '연결됨' : '연결 끊김'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50"
                                    onClick={() => handleEditVectorDB(db)}>수정</Button>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50"
                                    onClick={() => handleDeleteVectorDB(db.id, db.name)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <Pagination page={vectorDBPage} totalPages={vectorDBTotalPages} onPageChange={setVectorDBPage} />
                  </>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-12 text-center">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">검색 결과가 없습니다</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isAddVectorDBDialogOpen} onOpenChange={setIsAddVectorDBDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">Vector DB 추가</DialogTitle>
                  <DialogDescription className="text-gray-600">새로운 벡터 데이터베이스를 추가합니다</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="db-name">DB명 <span className="text-red-500">*</span></Label>
                    <Input id="db-name" value={vectorDBForm.name}
                      onChange={(e) => setVectorDBForm({ ...vectorDBForm, name: e.target.value })}
                      placeholder="Production Vector DB" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="db-type">DB 유형</Label>
                    <Select value={vectorDBForm.type} onValueChange={(val) => setVectorDBForm({ ...vectorDBForm, type: val })}>
                      <SelectTrigger id="db-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pinecone">Pinecone</SelectItem>
                        <SelectItem value="Weaviate">Weaviate</SelectItem>
                        <SelectItem value="Qdrant">Qdrant</SelectItem>
                        <SelectItem value="Milvus">Milvus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setIsAddVectorDBDialogOpen(false)} className="gap-2">
                    <X className="h-4 w-4" />취소
                  </Button>
                  <Button onClick={handleAddVectorDB} className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Plus className="h-4 w-4" />추가
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditVectorDBDialogOpen} onOpenChange={setIsEditVectorDBDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">Vector DB 수정</DialogTitle>
                  <DialogDescription className="text-gray-600">데이터베이스 정보를 수정합니다</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-db-name">DB명 <span className="text-red-500">*</span></Label>
                    <Input id="edit-db-name" value={vectorDBForm.name}
                      onChange={(e) => setVectorDBForm({ ...vectorDBForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-db-status">상태</Label>
                    <Select value={vectorDBForm.status} onValueChange={(val: any) => setVectorDBForm({ ...vectorDBForm, status: val })}>
                      <SelectTrigger id="edit-db-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="connected">연결됨</SelectItem>
                        <SelectItem value="disconnected">연결 끊김</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setIsEditVectorDBDialogOpen(false)} className="gap-2">
                    <X className="h-4 w-4" />취소
                  </Button>
                  <Button onClick={handleSaveVectorDB} className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Save className="h-4 w-4" />저장
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Datasets Tab */}
          <TabsContent value="datasets">
            <Card className="border-blue-100 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">
                <div>
                  <CardTitle className="text-gray-900">기본 데이터셋 관리</CardTitle>
                  <CardDescription className="text-gray-600">시스템 기본 제공 데이터셋을 관리합니다</CardDescription>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateDatasetDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />데이터셋 추가
                </Button>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-4 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-1.5 text-sm">
                    <HardDrive className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600">전체</span>
                    <span className="font-semibold text-gray-900">{baseDatasets.length}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">활성</span>
                    <span className="font-semibold text-gray-900">{activeDatasets}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input placeholder="데이터셋명 검색..." value={datasetSearch}
                      onChange={(e) => { setDatasetSearch(e.target.value); setDatasetPage(1); }}
                      className="pl-9 h-9 text-sm border-gray-300" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select value={datasetTypeFilter} onValueChange={(value: any) => { setDatasetTypeFilter(value); setDatasetPage(1); }}>
                      <SelectTrigger className="w-40 h-9 text-sm border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체 유형</SelectItem>
                        <SelectItem value="QA">QA</SelectItem>
                        <SelectItem value="Retrieval">Retrieval</SelectItem>
                        <SelectItem value="Summarization">Summarization</SelectItem>
                        <SelectItem value="Classification">Classification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {paginatedDatasets.length > 0 ? (
                  <>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-200 bg-gray-50">
                            <TableHead className="text-gray-700">데이터셋명</TableHead>
                            <TableHead className="text-gray-700">유형</TableHead>
                            <TableHead className="text-gray-700">항목 수</TableHead>
                            <TableHead className="text-gray-700">상태</TableHead>
                            <TableHead className="text-gray-700">작업</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedDatasets.map(ds => (
                            <TableRow key={ds.id} className="border-gray-200">
                              <TableCell>
                                <div>
                                  <div className="text-gray-900">{ds.name}</div>
                                  <div className="text-xs text-gray-500">{ds.description}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200 border">{ds.type}</Badge>
                              </TableCell>
                              <TableCell className="text-gray-900">{ds.itemCount.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge className={ds.status === 'active' 
                                  ? 'bg-green-100 text-green-700 border-green-200 border' 
                                  : 'bg-gray-100 text-gray-700 border-gray-200 border'}>
                                  {ds.status === 'active' ? '활성' : '비활성'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" 
                                    className={ds.status === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}
                                    onClick={() => handleToggleDatasetStatus(ds.id)}>
                                    {ds.status === 'active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50"
                                    onClick={() => handleDeleteDataset(ds.id, ds.name)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <Pagination page={datasetPage} totalPages={datasetTotalPages} onPageChange={setDatasetPage} />
                  </>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-12 text-center">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">검색 결과가 없습니다</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isCreateDatasetDialogOpen} onOpenChange={setIsCreateDatasetDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">데이터셋 추가</DialogTitle>
                  <DialogDescription className="text-gray-600">새로운 기본 데이터셋을 추가합니다</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataset-name">데이터셋명 <span className="text-red-500">*</span></Label>
                    <Input id="dataset-name" value={datasetForm.name}
                      onChange={(e) => setDatasetForm({ ...datasetForm, name: e.target.value })}
                      placeholder="My Dataset" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataset-description">설명</Label>
                    <Textarea id="dataset-description" value={datasetForm.description}
                      onChange={(e) => setDatasetForm({ ...datasetForm, description: e.target.value })}
                      placeholder="데이터셋 설명..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataset-type">유형</Label>
                      <Select value={datasetForm.type} onValueChange={(val: any) => setDatasetForm({ ...datasetForm, type: val })}>
                        <SelectTrigger id="dataset-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="QA">QA</SelectItem>
                          <SelectItem value="Retrieval">Retrieval</SelectItem>
                          <SelectItem value="Summarization">Summarization</SelectItem>
                          <SelectItem value="Classification">Classification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataset-format">포맷</Label>
                      <Select value={datasetForm.format} onValueChange={(val: any) => setDatasetForm({ ...datasetForm, format: val })}>
                        <SelectTrigger id="dataset-format">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="JSON">JSON</SelectItem>
                          <SelectItem value="CSV">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataset-file">파일 업로드 <span className="text-red-500">*</span></Label>
                    <Input id="dataset-file" type="file" accept=".json,.csv"
                      onChange={(e) => setDatasetForm({ ...datasetForm, file: e.target.files?.[0] || null })} />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => {
                    setIsCreateDatasetDialogOpen(false);
                    setDatasetForm({ name: '', description: '', type: 'QA', format: 'JSON', file: null });
                  }} className="gap-2">
                    <X className="h-4 w-4" />취소
                  </Button>
                  <Button onClick={handleCreateDataset} className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Plus className="h-4 w-4" />추가
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="border-blue-100 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">
                <div>
                  <CardTitle className="text-gray-900">사용자 관리</CardTitle>
                  <CardDescription className="text-gray-600">시스템 사용자 계정을 관리합니다</CardDescription>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateUserDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />사용자 추가
                </Button>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-4 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-1.5 text-sm">
                    <UsersIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600">전체</span>
                    <span className="font-semibold text-gray-900">{users.length}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <span className="text-gray-600">관리자</span>
                    <span className="font-semibold text-gray-900">{adminUsers}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <UserIcon className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">일반 사용자</span>
                    <span className="font-semibold text-gray-900">{regularUsers}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Activity className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">활성</span>
                    <span className="font-semibold text-gray-900">{activeUsers}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input placeholder="이름 또는 이메일 검색..." value={userSearch}
                      onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                      className="pl-9 h-9 text-sm border-gray-300" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select value={userRoleFilter} onValueChange={(value: any) => { setUserRoleFilter(value); setUserPage(1); }}>
                      <SelectTrigger className="w-32 h-9 text-sm border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체 역할</SelectItem>
                        <SelectItem value="admin">관리자</SelectItem>
                        <SelectItem value="user">사용자</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {paginatedUsers.length > 0 ? (
                  <>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-200 bg-gray-50">
                            <TableHead className="text-gray-700">이름</TableHead>
                            <TableHead className="text-gray-700">이메일</TableHead>
                            <TableHead className="text-gray-700">역할</TableHead>
                            <TableHead className="text-gray-700">상태</TableHead>
                            <TableHead className="text-gray-700">마지막 로그인</TableHead>
                            <TableHead className="text-gray-700">작업</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedUsers.map(user => (
                            <TableRow key={user.id} className="border-gray-200">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <UserIcon className="h-4 w-4 text-gray-500" />
                                  <span className="text-gray-900">{user.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-900">{user.email}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-700 border-purple-200 border' 
                                  : 'bg-gray-100 text-gray-700 border-gray-200 border'}>
                                  {user.role === 'admin' ? '관리자' : '사용자'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={user.status === 'active' 
                                  ? 'bg-green-100 text-green-700 border-green-200 border' 
                                  : 'bg-gray-100 text-gray-700 border-gray-200 border'}>
                                  {user.status === 'active' ? '활성' : '비활성'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-900 text-sm">{user.lastLogin || '-'}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50"
                                    onClick={() => handleEditUser(user)}>수정</Button>
                                  <Button variant="ghost" size="sm" 
                                    className={user.status === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}
                                    onClick={() => handleToggleUserStatus(user.id)}>
                                    {user.status === 'active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50"
                                    onClick={() => handleDeleteUser(user.id, user.name)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <Pagination page={userPage} totalPages={userTotalPages} onPageChange={setUserPage} />
                  </>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-12 text-center">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">검색 결과가 없습니다</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">새 사용자 추가</DialogTitle>
                  <DialogDescription className="text-gray-600">시스템에 새로운 사용자를 등록합니다</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">이름 <span className="text-red-500">*</span></Label>
                    <Input id="user-name" value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      placeholder="홍길동" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-email">이메일 <span className="text-red-500">*</span></Label>
                    <Input id="user-email" type="email" value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="user@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-password">비밀번호 <span className="text-red-500">*</span></Label>
                    <Input id="user-password" type="password" value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder="8자 이상" />
                    <p className="text-xs text-gray-500">비밀번호는 8자 이상이어야 합니다</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-role">역할</Label>
                    <Select value={userForm.role} onValueChange={(val: any) => setUserForm({ ...userForm, role: val })}>
                      <SelectTrigger id="user-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">사용자 (평가 실행 및 결과 조회)</SelectItem>
                        <SelectItem value="admin">관리자 (전체 시스템 관리)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => {
                    setIsCreateUserDialogOpen(false);
                    setUserForm({ name: '', email: '', role: 'user', password: '' });
                  }} className="gap-2">
                    <X className="h-4 w-4" />취소
                  </Button>
                  <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Plus className="h-4 w-4" />사용자 추가
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">사용자 정보 수정</DialogTitle>
                  <DialogDescription className="text-gray-600">사용자의 정보를 수정합니다</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-user-name">이름 <span className="text-red-500">*</span></Label>
                    <Input id="edit-user-name" value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      placeholder="홍길동" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-user-email">이메일 <span className="text-red-500">*</span></Label>
                    <Input id="edit-user-email" type="email" value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="user@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-user-role">역할</Label>
                    <Select value={userForm.role} onValueChange={(val: any) => setUserForm({ ...userForm, role: val })}>
                      <SelectTrigger id="edit-user-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">사용자</SelectItem>
                        <SelectItem value="admin">관리자</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-user-password">새 비밀번호 (선택사항)</Label>
                    <Input id="edit-user-password" type="password" value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder="변경하려면 입력하세요" />
                    <p className="text-xs text-gray-500">비밀번호를 변경하지 않으려면 비워두세요</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => {
                    setIsEditUserDialogOpen(false);
                    setEditingUser(null);
                  }} className="gap-2">
                    <X className="h-4 w-4" />취소
                  </Button>
                  <Button onClick={handleSaveUser} className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Save className="h-4 w-4" />저장
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="apikeys">
            <Card className="border-blue-100 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">
                <div>
                  <CardTitle className="text-gray-900">API 키 관리</CardTitle>
                  <CardDescription className="text-gray-600">외부 연동을 위한 API 키를 관리합니다</CardDescription>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateAPIKeyDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />API 키 생성
                </Button>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-4 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Key className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600">전체</span>
                    <span className="font-semibold text-gray-900">{apiKeys.length}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">활성</span>
                    <span className="font-semibold text-gray-900">{activeAPIKeys}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input placeholder="API 키명 검색..." value={apiKeySearch}
                      onChange={(e) => { setApiKeySearch(e.target.value); setApiKeyPage(1); }}
                      className="pl-9 h-9 text-sm border-gray-300" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select value={apiKeyStatusFilter} onValueChange={(value: any) => { setApiKeyStatusFilter(value); setApiKeyPage(1); }}>
                      <SelectTrigger className="w-32 h-9 text-sm border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체 상태</SelectItem>
                        <SelectItem value="active">활성</SelectItem>
                        <SelectItem value="expired">만료됨</SelectItem>
                        <SelectItem value="revoked">무효화됨</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {paginatedAPIKeys.length > 0 ? (
                  <>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-200 bg-gray-50">
                            <TableHead className="text-gray-700">이름</TableHead>
                            <TableHead className="text-gray-700">API 키</TableHead>
                            <TableHead className="text-gray-700">권한</TableHead>
                            <TableHead className="text-gray-700">상태</TableHead>
                            <TableHead className="text-gray-700">마지막 사용</TableHead>
                            <TableHead className="text-gray-700">작업</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedAPIKeys.map(key => (
                            <TableRow key={key.id} className="border-gray-200">
                              <TableCell>
                                <div>
                                  <div className="text-gray-900">{key.name}</div>
                                  <div className="text-xs text-gray-500">{key.description}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <code className="text-sm text-gray-900">{maskAPIKey(key.key)}</code>
                              </TableCell>
                              <TableCell>
                                <Badge className={key.permission === 'full' 
                                  ? 'bg-purple-100 text-purple-700 border-purple-200 border' 
                                  : 'bg-gray-100 text-gray-700 border-gray-200 border'}>
                                  {key.permission === 'full' ? '전체' : '읽기 전용'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  key.status === 'active' ? 'bg-green-100 text-green-700 border-green-200 border' :
                                  key.status === 'expired' ? 'bg-amber-100 text-amber-700 border-amber-200 border' :
                                  'bg-red-100 text-red-700 border-red-200 border'
                                }>
                                  {key.status === 'active' ? '활성' : key.status === 'expired' ? '만료됨' : '무효화됨'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-900 text-sm">{key.lastUsed || '-'}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50"
                                        onClick={() => handleCopyAPIKey(key.id, key.key)}>
                                        {copiedKeyId === key.id ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">API 키 복사</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  {key.status === 'active' && (
                                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50"
                                      onClick={() => handleRevokeAPIKey(key.id, key.name)}>무효화</Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <Pagination page={apiKeyPage} totalPages={apiKeyTotalPages} onPageChange={setApiKeyPage} />
                  </>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-12 text-center">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">검색 결과가 없습니다</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isCreateAPIKeyDialogOpen} onOpenChange={(open) => {
              if (!open) handleCloseCreateDialog();
              setIsCreateAPIKeyDialogOpen(open);
            }}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">
                    {newlyCreatedKey ? 'API 키 생성 완료' : 'API 키 생성'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    {newlyCreatedKey 
                      ? '생성된 API 키를 안전하게 보관하세요. 다시 확인할 수 없습니다.' 
                      : '새로운 API 키를 생성합니다'}
                  </DialogDescription>
                </DialogHeader>
                
                {newlyCreatedKey ? (
                  <div className="space-y-4 mt-4">
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-900">
                        API 키가 성공적으로 생성되었습니다
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                      <Label>생성된 API 키</Label>
                      <div className="flex gap-2">
                        <Input value={newlyCreatedKey} readOnly className="font-mono" />
                        <Button onClick={() => handleCopyAPIKey('temp', newlyCreatedKey)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-amber-600">
                        ⚠️ 이 키는 다시 표시되지 않습니다. 안전한 곳에 저장하세요.
                      </p>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleCloseCreateDialog}>
                      확인
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="api-key-name">API 키 이름 <span className="text-red-500">*</span></Label>
                        <Input id="api-key-name" value={apiKeyForm.name}
                          onChange={(e) => setApiKeyForm({ ...apiKeyForm, name: e.target.value })}
                          placeholder="Production API" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="api-key-description">설명</Label>
                        <Textarea id="api-key-description" value={apiKeyForm.description}
                          onChange={(e) => setApiKeyForm({ ...apiKeyForm, description: e.target.value })}
                          placeholder="API 키 용도 설명..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="api-key-permission">권한 레벨</Label>
                        <Select value={apiKeyForm.permission} onValueChange={(val: any) => setApiKeyForm({ ...apiKeyForm, permission: val })}>
                          <SelectTrigger id="api-key-permission">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="read">읽기 전용 (조회만 가능)</SelectItem>
                            <SelectItem value="full">전체 권한 (생성/수정/삭제)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch checked={apiKeyForm.hasExpiration}
                          onCheckedChange={(checked) => setApiKeyForm({ ...apiKeyForm, hasExpiration: checked })} />
                        <Label>만료일 설정</Label>
                      </div>
                      {apiKeyForm.hasExpiration && (
                        <div className="space-y-2">
                          <Label htmlFor="api-key-expires">만료일</Label>
                          <Input id="api-key-expires" type="date" value={apiKeyForm.expiresAt}
                            onChange={(e) => setApiKeyForm({ ...apiKeyForm, expiresAt: e.target.value })} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <Button variant="outline" onClick={() => setIsCreateAPIKeyDialogOpen(false)} className="gap-2">
                        <X className="h-4 w-4" />취소
                      </Button>
                      <Button onClick={handleCreateAPIKey} className="bg-blue-600 hover:bg-blue-700 gap-2">
                        <Key className="h-4 w-4" />생성
                      </Button>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
