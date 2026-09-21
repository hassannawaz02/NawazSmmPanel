import { useState, useEffect, useMemo } from 'react';
import { servicesAPI, adminAPI, providerAPI } from '../../services/api';
import {
  Card,
  Button,
  Input,
  Table,
  Modal,
  Badge,
  PageLoader,
} from '../../components/ui';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineDownload,
  HiOutlineSearch,
  HiOutlineDuplicate,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineEye,
  HiOutlineSortAscending,
  HiOutlineSortDescending,
  HiOutlineDocumentDownload,
  HiOutlineAdjustments,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineCalculator,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminServices = () => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const [sortKey, setSortKey] = useState('sortOrder');
  const [sortDir, setSortDir] = useState('asc');
  const [viewMode, setViewMode] = useState('table');

  const [previewService, setPreviewService] = useState(null);
  const [marginModalOpen, setMarginModalOpen] = useState(false);
  const [marginPercent, setMarginPercent] = useState('');
  const [calcModalOpen, setCalcModalOpen] = useState(false);
  const [calcCost, setCalcCost] = useState('');
  const [calcMargin, setCalcMargin] = useState('');
  const [bulkCategoryModalOpen, setBulkCategoryModalOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    rate: '',
    providerRate: '',
    min: '',
    max: '',
    providerServiceId: '',
    sortOrder: '9999',
    categorySortOrder: '9999',
    isManual: false,
    isActive: true,
  });

  const [sortOrderWarning, setSortOrderWarning] = useState('');
  const [categorySortOrderWarning, setCategorySortOrderWarning] = useState('');

  useEffect(() => {
    fetchServices();
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await providerAPI.getAll();
      setProviders(response.data.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getAll({ status: 'all' });
      setServices(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = [...new Set(services.map((s) => s.category))];
    return cats.sort();
  }, [services]);

  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.isActive).length;
    const inactive = total - active;
    const manual = services.filter((s) => s.isManual).length;
    const apiServices = total - manual;
    const totalProfit = services.reduce((acc, s) => acc + ((s.rate || 0) - (s.providerRate || 0)), 0);
    const avgMargin = total > 0 ? services.reduce((acc, s) => {
      const profit = (s.rate || 0) - (s.providerRate || 0);
      return acc + (s.rate > 0 ? (profit / s.rate) * 100 : 0);
    }, 0) / total : 0;
    const categoryCount = categories.length;
    return { total, active, inactive, manual, apiServices, totalProfit, avgMargin, categoryCount };
  }, [services, categories]);

  const filteredServices = useMemo(() => {
    let result = services.filter((service) => {
      const matchesSearch =
        !search ||
        service.title.toLowerCase().includes(search.toLowerCase()) ||
        service.category.toLowerCase().includes(search.toLowerCase()) ||
        (service.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (service.providerServiceId || '').includes(search);
      const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && service.isActive) ||
        (filterStatus === 'inactive' && !service.isActive);
      const matchesType =
        filterType === 'all' ||
        (filterType === 'manual' && service.isManual) ||
        (filterType === 'api' && !service.isManual);
      return matchesSearch && matchesCategory && matchesStatus && matchesType;
    });

    result.sort((a, b) => {
      let aVal, bVal;
      switch (sortKey) {
        case 'sortOrder': aVal = a.sortOrder || 9999; bVal = b.sortOrder || 9999; break;
        case 'title': aVal = a.title.toLowerCase(); bVal = b.title.toLowerCase(); break;
        case 'category': aVal = a.category.toLowerCase(); bVal = b.category.toLowerCase(); break;
        case 'rate': aVal = a.rate || 0; bVal = b.rate || 0; break;
        case 'providerRate': aVal = a.providerRate || 0; bVal = b.providerRate || 0; break;
        case 'profit': aVal = (a.rate || 0) - (a.providerRate || 0); bVal = (b.rate || 0) - (b.providerRate || 0); break;
        case 'min': aVal = a.min || 0; bVal = b.min || 0; break;
        default: aVal = a.title.toLowerCase(); bVal = b.title.toLowerCase();
      }
      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [services, search, filterCategory, filterStatus, filterType, sortKey, sortDir]);

  const groupedServices = useMemo(() => {
    const groups = {};
    filteredServices.forEach((s) => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    Object.keys(groups).forEach((cat) => {
      groups[cat].sort((a, b) => (a.sortOrder || 9999) - (b.sortOrder || 9999));
    });
    const sortedEntries = Object.entries(groups).sort((a, b) => {
      const aSort = a[1][0]?.categorySortOrder || 9999;
      const bSort = b[1][0]?.categorySortOrder || 9999;
      return aSort - bSort;
    });
    return Object.fromEntries(sortedEntries);
  }, [filteredServices]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ columnKey }) => {
    if (sortKey !== columnKey) return <HiOutlineSortAscending className="w-3 h-3 text-gray-300 inline ml-1" />;
    return sortDir === 'asc'
      ? <HiOutlineSortAscending className="w-3 h-3 text-primary-600 inline ml-1" />
      : <HiOutlineSortDescending className="w-3 h-3 text-primary-600 inline ml-1" />;
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        title: service.title,
        category: service.category,
        description: service.description || '',
        rate: service.rate.toString(),
        providerRate: (service.providerRate || 0).toString(),
        min: service.min.toString(),
        max: service.max.toString(),
        providerServiceId: service.providerServiceId,
        sortOrder: (service.sortOrder || 9999).toString(),
        categorySortOrder: (service.categorySortOrder || 9999).toString(),
        isManual: service.isManual || false,
        isActive: service.isActive,
      });
    } else {
      setEditingService(null);
      setFormData({
        title: '',
        category: '',
        description: '',
        rate: '',
        providerRate: '',
        min: '',
        max: '',
        providerServiceId: '',
        sortOrder: '9999',
        categorySortOrder: '9999',
        isManual: false,
        isActive: true,
      });
    }
    setModalOpen(true);
    setSortOrderWarning('');
    setCategorySortOrderWarning('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        ...formData,
        rate: parseFloat(formData.rate),
        providerRate: parseFloat(formData.providerRate) || 0,
        min: parseInt(formData.min),
        max: parseInt(formData.max),
        sortOrder: parseInt(formData.sortOrder) || 0,
        categorySortOrder: parseInt(formData.categorySortOrder) || 9999,
        isManual: formData.isManual,
      };

      if (editingService) {
        await servicesAPI.update(editingService.id, data);
        toast.success('Service updated successfully');
      } else {
        await servicesAPI.create(data);
        toast.success('Service created successfully');
      }

      setModalOpen(false);
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      await servicesAPI.delete(id);
      toast.success('Service deleted successfully');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const handleDuplicate = async (service) => {
    try {
      const data = {
        title: `${service.title} (Copy)`,
        category: service.category,
        description: service.description || '',
        rate: service.rate,
        providerRate: service.providerRate || 0,
        min: service.min,
        max: service.max,
        providerServiceId: service.providerServiceId ? `${service.providerServiceId}_copy` : '',
        isManual: service.isManual || false,
        isActive: false,
      };
      await servicesAPI.create(data);
      toast.success('Service duplicated successfully');
      fetchServices();
    } catch (error) {
      toast.error('Failed to duplicate service');
    }
  };

  const handleQuickToggle = async (service) => {
    try {
      await servicesAPI.update(service.id, { isActive: !service.isActive });
      toast.success(`Service ${service.isActive ? 'deactivated' : 'activated'}`);
      fetchServices();
    } catch (error) {
      toast.error('Failed to update service');
    }
  };

  const checkDuplicateSortOrder = async (value, field) => {
    if (!value || value === '9999') {
      if (field === 'sortOrder') setSortOrderWarning('');
      else setCategorySortOrderWarning('');
      return;
    }
    try {
      const params = { [field]: parseInt(value) };
      if (editingService) params.excludeId = editingService.id;
      const res = await servicesAPI.checkSortOrder(params);
      if (res.data.data.duplicate) {
        const next = res.data.data.nextAvailable;
        const msg = `Number ${value} already assigned to "${res.data.data.existing.title}" (${res.data.data.existing.category}). Next available: ${next}`;
        if (field === 'sortOrder') setSortOrderWarning(msg);
        else setCategorySortOrderWarning(msg);
      } else {
        if (field === 'sortOrder') setSortOrderWarning('');
        else setCategorySortOrderWarning('');
      }
    } catch (err) {
      // ignore
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredServices.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} services?`)) return;

    try {
      await servicesAPI.bulkDelete(selectedIds);
      toast.success(`${selectedIds.length} services deleted successfully`);
      setSelectedIds([]);
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete services');
    }
  };

  const handleBulkStatus = async (isActive) => {
    const action = isActive ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${action} ${selectedIds.length} services?`)) return;

    try {
      await Promise.all(
        selectedIds.map((id) => servicesAPI.update(id, { isActive }))
      );
      toast.success(`${selectedIds.length} services ${action}d successfully`);
      setSelectedIds([]);
      fetchServices();
    } catch (error) {
      toast.error(`Failed to ${action} services`);
    }
  };

  const handleBulkMargin = async () => {
    const percent = parseFloat(marginPercent);
    if (!percent || percent <= -100) {
      toast.error('Please enter a valid margin %');
      return;
    }

    if (!window.confirm(`Selected ${selectedIds.length} services pe ${percent}% margin lagana hai? Selling rate auto update hoga.`)) return;

    try {
      await Promise.all(
        selectedIds.map((id) => {
          const service = services.find((s) => s.id === id);
          if (!service || !service.providerRate) return Promise.resolve();
          const newRate = service.providerRate * (1 + percent / 100);
          return servicesAPI.update(id, { rate: parseFloat(newRate.toFixed(2)) });
        })
      );
      toast.success(`Margin applied to ${selectedIds.length} services`);
      setMarginModalOpen(false);
      setMarginPercent('');
      setSelectedIds([]);
      fetchServices();
    } catch (error) {
      toast.error('Failed to apply margin');
    }
  };

  const handleBulkCategoryChange = async () => {
    if (!bulkCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    if (!window.confirm(`Selected ${selectedIds.length} services ki category "${bulkCategory}" mein change karni hai?`)) return;

    try {
      await Promise.all(
        selectedIds.map((id) => servicesAPI.update(id, { category: bulkCategory.trim() }))
      );
      toast.success(`Category changed for ${selectedIds.length} services`);
      setBulkCategoryModalOpen(false);
      setBulkCategory('');
      setSelectedIds([]);
      fetchServices();
    } catch (error) {
      toast.error('Failed to change category');
    }
  };

  const handleSyncFromProvider = async () => {
    if (!window.confirm('Provider se services sync karni hain? Naye services add honge aur purane update honge.')) return;

    setSyncing(true);
    try {
      const response = await adminAPI.syncServices(selectedProvider || undefined);
      const { total, created, updated, skipped } = response.data.data;
      toast.success(`Sync complete! Total: ${total}, Naye: ${created}, Updated: ${updated}, Skipped: ${skipped}`);
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to sync services');
    } finally {
      setSyncing(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Cat Sort', 'Sort', 'Title', 'Category', 'Rate', 'Provider Rate', 'Profit', 'Min', 'Max', 'Status', 'Type', 'Provider Service ID'];
    const rows = filteredServices.map((s) => [
      s.sortOrder || 0,
      s.title,
      s.category,
      s.rate,
      s.providerRate || 0,
      ((s.rate || 0) - (s.providerRate || 0)).toFixed(2),
      s.min,
      s.max,
      s.isActive ? 'Active' : 'Inactive',
      s.isManual ? 'Manual' : 'API',
      s.providerServiceId || '',
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `services_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const getProfitColor = (profit) => {
    if (profit > 0) return 'bg-green-600 text-white';
    if (profit < 0) return 'bg-red-600 text-white';
    return 'bg-gray-400 text-white';
  };

  const columns = [
    {
      key: '_select',
      title: (
        <input
          type="checkbox"
          checked={selectedIds.length === filteredServices.length && filteredServices.length > 0}
          onChange={handleSelectAll}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      ),
      render: (_, row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={() => handleSelectOne(row.id)}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      ),
    },
    {
      key: 'title',
      title: <span className="cursor-pointer select-none" onClick={() => handleSort('title')}>Service <SortIcon columnKey="title" /></span>,
      render: (title, row) => (
        <div>
          <span className="font-medium">{title}</span>
          <p className="text-xs text-gray-400 mt-0.5">{row.category}</p>
        </div>
      ),
    },
    {
      key: 'categorySortOrder',
      title: <span className="cursor-pointer select-none" onClick={() => handleSort('categorySortOrder')}>Cat# <SortIcon columnKey="categorySortOrder" /></span>,
      render: (val) => (
        <span className="inline-flex items-center justify-center w-7 h-7 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
          {val && val < 9999 ? val : '-'}
        </span>
      ),
    },
    {
      key: 'sortOrder',
      title: <span className="cursor-pointer select-none" onClick={() => handleSort('sortOrder')}># <SortIcon columnKey="sortOrder" /></span>,
      render: (sortOrder) => (
        <span className="inline-flex items-center justify-center w-7 h-7 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
          {sortOrder && sortOrder < 9999 ? sortOrder : '-'}
        </span>
      ),
    },
    {
      key: 'rate',
      title: <span className="cursor-pointer select-none" onClick={() => handleSort('rate')}>Rate <SortIcon columnKey="rate" /></span>,
      render: (rate, row) => {
        const isFixed = row.min === row.max;
        return (
          <span className="inline-block bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
            PKR {Number(rate || 0).toFixed(2)}{isFixed ? '' : '/1000'}
          </span>
        );
      },
    },
    {
      key: 'providerRate',
      title: <span className="cursor-pointer select-none" onClick={() => handleSort('providerRate')}>Cost <SortIcon columnKey="providerRate" /></span>,
      render: (rate, row) => {
        const isFixed = row.min === row.max;
        return (
          <span className="inline-block bg-gray-500 text-white text-xs font-medium px-2 py-1 rounded">
            PKR {Number(rate || 0).toFixed(2)}{isFixed ? '' : '/1000'}
          </span>
        );
      },
    },
    {
      key: 'profit',
      title: <span className="cursor-pointer select-none" onClick={() => handleSort('profit')}>Profit <SortIcon columnKey="profit" /></span>,
      render: (_, row) => {
        const profit = (row.rate || 0) - (row.providerRate || 0);
        const isFixed = row.min === row.max;
        const margin = row.rate > 0 ? ((profit / row.rate) * 100).toFixed(0) : 0;
        return (
          <div>
            <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${getProfitColor(profit)}`}>
              {profit >= 0 ? '+' : ''} PKR {Math.abs(profit).toFixed(2)}{isFixed ? '' : '/1000'}
            </span>
            {profit > 0 && (
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(parseFloat(margin), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{margin}%</p>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'min',
      title: <span className="cursor-pointer select-none" onClick={() => handleSort('min')}>Min / Max <SortIcon columnKey="min" /></span>,
      render: (_, row) => (
        <span className="text-sm">
          {row.min === row.max ? (
            <span className="font-medium text-primary-600">{row.min} (Fixed)</span>
          ) : (
            `${row.min} / ${row.max}`
          )}
        </span>
      ),
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (isActive, row) => (
        <button
          onClick={() => handleQuickToggle(row)}
          className="cursor-pointer"
          title="Click to toggle"
        >
          <Badge variant={isActive ? 'success' : 'danger'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </button>
      ),
    },
    {
      key: 'isManual',
      title: 'Type',
      render: (isManual) =>
        isManual ? (
          <Badge variant="warning">Manual</Badge>
        ) : (
          <Badge variant="info">API</Badge>
        ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1">
          <button
            onClick={() => setPreviewService(row)}
            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded"
            title="View Details"
          >
            <HiOutlineEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenModal(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <HiOutlinePencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDuplicate(row)}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
            title="Duplicate"
          >
            <HiOutlineDuplicate className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Services</h1>
          <p className="text-gray-500 mt-1">Add, edit, or remove services</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {selectedIds.length > 0 && (
            <>
              <Button variant="danger" onClick={handleBulkDelete}>
                <HiOutlineTrash className="w-4 h-4 mr-1" />
                Delete ({selectedIds.length})
              </Button>
              <Button variant="secondary" onClick={() => handleBulkStatus(true)}>
                <HiOutlineCheckCircle className="w-4 h-4 mr-1" />
                Activate ({selectedIds.length})
              </Button>
              <Button variant="secondary" onClick={() => handleBulkStatus(false)}>
                <HiOutlineXCircle className="w-4 h-4 mr-1" />
                Deactivate ({selectedIds.length})
              </Button>
              <Button variant="secondary" onClick={() => setMarginModalOpen(true)}>
                <HiOutlineAdjustments className="w-4 h-4 mr-1" />
                Margin ({selectedIds.length})
              </Button>
              <Button variant="secondary" onClick={() => setBulkCategoryModalOpen(true)}>
                <HiOutlineViewGrid className="w-4 h-4 mr-1" />
                Category ({selectedIds.length})
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={handleExportCSV}>
            <HiOutlineDocumentDownload className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="secondary" onClick={() => setCalcModalOpen(true)}>
            <HiOutlineCalculator className="w-4 h-4 mr-1" />
            Calculator
          </Button>
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 ${viewMode === 'table' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
              title="Table View"
            >
              <HiOutlineViewList className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grouped')}
              className={`p-2 ${viewMode === 'grouped' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
              title="Grouped View"
            >
              <HiOutlineViewGrid className="w-5 h-5" />
            </button>
          </div>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Default Provider (env)</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <Button onClick={handleSyncFromProvider} loading={syncing} variant="secondary">
            <HiOutlineDownload className="w-5 h-5 mr-2" />
            {syncing ? 'Syncing...' : 'Sync'}
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <HiOutlinePlus className="w-5 h-5 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <Card className="p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Active</p>
          <p className="text-xl font-bold text-green-600">{stats.active}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Inactive</p>
          <p className="text-xl font-bold text-red-600">{stats.inactive}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">API</p>
          <p className="text-xl font-bold text-blue-600">{stats.apiServices}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Manual</p>
          <p className="text-xl font-bold text-yellow-600">{stats.manual}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Categories</p>
          <p className="text-xl font-bold text-purple-600">{stats.categoryCount}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Margin</p>
          <p className="text-xl font-bold text-primary-600">{stats.avgMargin.toFixed(0)}%</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search title, category, description, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Types</option>
            <option value="api">API</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        {(search || filterCategory !== 'all' || filterStatus !== 'all' || filterType !== 'all') && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Showing {filteredServices.length} of {services.length} services
            </span>
            <button
              onClick={() => { setSearch(''); setFilterCategory('all'); setFilterStatus('all'); setFilterType('all'); }}
              className="text-xs text-primary-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </Card>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={filteredServices}
              emptyMessage="No services found"
            />
          </div>
        </Card>
      )}

      {/* Grouped View */}
      {viewMode === 'grouped' && (
        <div className="space-y-4">
          {Object.entries(groupedServices).map(([category, catServices]) => (
            <Card key={category}>
              <div className="px-4 py-3 bg-gray-50 border-b">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{category}</h3>
                  <Badge variant="primary">{catServices.length}</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Profit: PKR {catServices.reduce((acc, s) => acc + ((s.rate || 0) - (s.providerRate || 0)), 0).toFixed(2)}
                </p>
              </div>
              <div className="divide-y overflow-hidden">
                {catServices.map((service) => {
                  const profit = (service.rate || 0) - (service.providerRate || 0);
                  const isFixed = service.min === service.max;
                  const margin = service.rate > 0 ? ((profit / service.rate) * 100).toFixed(0) : 0;
                  return (
                    <div key={service.id} className="px-4 py-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-purple-600 bg-purple-50 w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0">
                              {service.categorySortOrder && service.categorySortOrder < 9999 ? service.categorySortOrder : ''}
                            </span>
                            <span className="text-xs font-bold text-gray-400 bg-gray-100 w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0">
                              {service.sortOrder && service.sortOrder < 9999 ? service.sortOrder : ''}
                            </span>
                            <span className="font-medium text-gray-900 truncate">{service.title}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant={service.isActive ? 'success' : 'danger'}>
                              {service.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {service.isManual && <Badge variant="warning">Manual</Badge>}
                            <span className="text-xs text-gray-500">PKR {service.rate}{isFixed ? '' : '/1000'}</span>
                            <span className={`text-xs font-medium ${profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                               {margin > 0 ? `(${margin}%)` : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">
                          <button onClick={() => setPreviewService(service)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="View">
                            <HiOutlineEye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleOpenModal(service)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDuplicate(service)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded" title="Duplicate">
                            <HiOutlineDuplicate className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(service.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
          {Object.keys(groupedServices).length === 0 && (
            <Card className="p-8 text-center text-gray-500">No services found</Card>
          )}
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewService}
        onClose={() => setPreviewService(null)}
        title="Service Details"
        size="lg"
      >
        {previewService && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Title</p>
                <p className="font-medium text-gray-900">{previewService.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Category</p>
                <p className="font-medium text-gray-900">{previewService.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Selling Rate</p>
                <p className="font-medium text-blue-600">PKR {previewService.rate}{previewService.min === previewService.max ? '' : '/1000'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Provider Rate</p>
                <p className="font-medium text-gray-600">PKR {previewService.providerRate || 0}{previewService.min === previewService.max ? '' : '/1000'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Profit</p>
                <p className={`font-medium ${((previewService.rate || 0) - (previewService.providerRate || 0)) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  PKR {((previewService.rate || 0) - (previewService.providerRate || 0)).toFixed(2)}
                  {previewService.rate > 0 && ` (${(((previewService.rate || 0) - (previewService.providerRate || 0)) / previewService.rate * 100).toFixed(0)}%)`}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Min / Max</p>
                <p className="font-medium text-gray-900">
                  {previewService.min === previewService.max
                    ? `${previewService.min} (Fixed)`
                    : `${previewService.min} / ${previewService.max}`}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Status</p>
                <Badge variant={previewService.isActive ? 'success' : 'danger'}>
                  {previewService.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Type</p>
                <Badge variant={previewService.isManual ? 'warning' : 'info'}>
                  {previewService.isManual ? 'Manual' : 'API'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Provider Service ID</p>
                <p className="font-mono text-sm text-gray-700">{previewService.providerServiceId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Service ID</p>
                <p className="font-mono text-xs text-gray-500">{previewService.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Category Sort</p>
                <p className="font-medium text-gray-900">{previewService.categorySortOrder || 9999}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Sort Order</p>
                <p className="font-medium text-gray-900">{previewService.sortOrder || 9999}</p>
              </div>
            </div>
            {previewService.description && (
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Description</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg" style={{ whiteSpace: 'pre-line' }}>{previewService.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Margin Modal */}
      <Modal
        isOpen={marginModalOpen}
        onClose={() => { setMarginModalOpen(false); setMarginPercent(''); }}
        title="Apply Margin"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Selected {selectedIds.length} services ka provider rate ke upar margin % lagao.
            Selling rate auto calculate hoga.
          </p>
          <Input
            label="Margin %"
            type="number"
            placeholder="e.g., 30"
            value={marginPercent}
            onChange={(e) => setMarginPercent(e.target.value)}
          />
          {marginPercent && selectedIds.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p className="text-gray-600">Preview (first selected service):</p>
              {(() => {
                const s = services.find((sv) => selectedIds.includes(sv.id));
                if (!s || !s.providerRate) return <p className="text-gray-400">No provider rate set</p>;
                const newRate = s.providerRate * (1 + parseFloat(marginPercent) / 100);
                return (
                  <div className="mt-1">
                    <p>Cost: <span className="font-medium">PKR {s.providerRate}</span></p>
                    <p>New Rate: <span className="font-medium text-blue-600">PKR {newRate.toFixed(2)}</span></p>
                    <p>Profit: <span className="font-medium text-green-600">PKR {(newRate - s.providerRate).toFixed(2)}</span></p>
                  </div>
                );
              })()}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setMarginModalOpen(false); setMarginPercent(''); }}>Cancel</Button>
            <Button onClick={handleBulkMargin}>Apply</Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Category Modal */}
      <Modal
        isOpen={bulkCategoryModalOpen}
        onClose={() => { setBulkCategoryModalOpen(false); setBulkCategory(''); }}
        title="Change Category"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Selected {selectedIds.length} services ki category change karo.
          </p>
          <Input
            label="New Category"
            placeholder="e.g., PUBG Mobile"
            value={bulkCategory}
            onChange={(e) => setBulkCategory(e.target.value)}
          />
          <div className="flex flex-wrap gap-1">
            {categories.slice(0, 10).map((cat) => (
              <button
                key={cat}
                onClick={() => setBulkCategory(cat)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full"
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setBulkCategoryModalOpen(false); setBulkCategory(''); }}>Cancel</Button>
            <Button onClick={handleBulkCategoryChange}>Change</Button>
          </div>
        </div>
      </Modal>

      {/* Rate Calculator Modal */}
      <Modal
        isOpen={calcModalOpen}
        onClose={() => { setCalcModalOpen(false); setCalcCost(''); setCalcMargin(''); }}
        title="Rate Calculator"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Provider Cost (per 1000)"
            type="number"
            step="0.01"
            placeholder="e.g., 224"
            value={calcCost}
            onChange={(e) => setCalcCost(e.target.value)}
          />
          <Input
            label="Desired Margin %"
            type="number"
            placeholder="e.g., 30"
            value={calcMargin}
            onChange={(e) => setCalcMargin(e.target.value)}
          />
          {calcCost && calcMargin && (
            <div className="bg-primary-50 p-4 rounded-lg space-y-2">
              {(() => {
                const cost = parseFloat(calcCost);
                const margin = parseFloat(calcMargin);
                const sellingRate = cost * (1 + margin / 100);
                const profit = sellingRate - cost;
                const fixedPrice30 = (sellingRate / 1000) * 30;
                const fixedPrice60 = (sellingRate / 1000) * 60;
                const fixedPrice100 = (sellingRate / 1000) * 100;
                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Selling Rate:</span>
                      <span className="font-bold text-primary-600">PKR {sellingRate.toFixed(2)}/1000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Profit per 1000:</span>
                      <span className="font-bold text-green-600">PKR {profit.toFixed(2)}</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">30 UC price:</span>
                      <span className="font-medium">PKR {fixedPrice30.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">60 UC price:</span>
                      <span className="font-medium">PKR {fixedPrice60.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">100 UC price:</span>
                      <span className="font-medium">PKR {fixedPrice100.toFixed(2)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => { setCalcModalOpen(false); setCalcCost(''); setCalcMargin(''); }}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Service Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? 'Edit Service' : 'Add Service'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Instagram Followers"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Line breaks support hoti hain..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Provider Rate (per 1000)"
              type="number"
              step="0.01"
              helperText="Cost from provider"
              value={formData.providerRate}
              onChange={(e) => setFormData({ ...formData, providerRate: e.target.value })}
            />
            <Input
              label="Selling Rate (per 1000)"
              type="number"
              step="0.01"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              required
            />
            <div className="flex flex-col justify-end gap-2">
              <div className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                (parseFloat(formData.rate) || 0) - (parseFloat(formData.providerRate) || 0) > 0
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
                Profit: PKR {((parseFloat(formData.rate) || 0) - (parseFloat(formData.providerRate) || 0)).toFixed(2)}
                {parseFloat(formData.min) === parseFloat(formData.max) && parseFloat(formData.min) > 0
                  ? ' (Flat)'
                  : '/1000'}
              </div>
              {formData.providerRate && parseFloat(formData.providerRate) > 0 && formData.rate && (
                <div className="px-3 py-1 text-xs text-gray-500 bg-gray-50 rounded-lg border">
                  Margin: {((((parseFloat(formData.rate) || 0) - (parseFloat(formData.providerRate) || 0)) / (parseFloat(formData.rate) || 1)) * 100).toFixed(0)}%
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Minimum"
              type="number"
              value={formData.min}
              onChange={(e) => setFormData({ ...formData, min: e.target.value })}
              required
            />
            <Input
              label="Maximum"
              type="number"
              value={formData.max}
              onChange={(e) => setFormData({ ...formData, max: e.target.value })}
              required
            />
          </div>
          <Input
            label="Provider Service ID"
            value={formData.providerServiceId}
            onChange={(e) =>
              setFormData({ ...formData, providerServiceId: e.target.value })
            }
            required
          />
          <Input
            label="Sort Order (Service Position)"
            type="number"
            placeholder="1 = pehle, 2 = doosra, 3 = teesra..."
            helperText={sortOrderWarning || "Kam number = pehle dikhega. 9999 = default."}
            error={!!sortOrderWarning}
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
            onBlur={() => checkDuplicateSortOrder(formData.sortOrder, 'sortOrder')}
          />
          <Input
            label="Category Sort Order"
            type="number"
            placeholder="1 = pehle, 2 = doosra, 3 = teesra..."
            helperText={categorySortOrderWarning || "Category ka position. Kam number = pehle dikhega. 9999 = default."}
            error={!!categorySortOrderWarning}
            value={formData.categorySortOrder}
            onChange={(e) => setFormData({ ...formData, categorySortOrder: e.target.value })}
            onBlur={() => checkDuplicateSortOrder(formData.categorySortOrder, 'categorySortOrder')}
          />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isManual"
                checked={formData.isManual}
                onChange={(e) =>
                  setFormData({ ...formData, isManual: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isManual" className="text-sm text-gray-700">
                Manual (API call skip hoga)
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingService ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminServices;
