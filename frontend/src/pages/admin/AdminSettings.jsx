import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, siteSettingsAPI } from '../../services/api';
import { Card, Button, Input } from '../../components/ui';
import toast from 'react-hot-toast';
import { HiOutlineCog, HiOutlineLockClosed, HiOutlineMail, HiOutlineChat, HiOutlineGlobe } from 'react-icons/hi';

const DEFAULT_WHATSAPP = {
  enabled: true,
  number: '923435071757',
  pages: {
    dashboard: true,
    newOrder: true,
    orders: true,
    services: true,
    addFunds: true,
    notifications: true,
    profile: true,
    adminDashboard: true,
    adminOrders: true,
    adminServices: true,
    adminUsers: true,
    adminSettings: true,
  },
};

const AdminSettings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [whatsAppSettings, setWhatsAppSettings] = useState(DEFAULT_WHATSAPP);
  const [whatsAppLoading, setWhatsAppLoading] = useState(false);
  const [siteLoading, setSiteLoading] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    siteName: '',
    siteTagline: '',
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    username: user?.username || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('whatsapp_settings');
    if (saved) {
      setWhatsAppSettings({ ...DEFAULT_WHATSAPP, ...JSON.parse(saved) });
    }
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const res = await siteSettingsAPI.get();
      setSiteSettings({
        siteName: res.data.data.siteName || '',
        siteTagline: res.data.data.siteTagline || '',
      });
    } catch (error) {
      console.error('Failed to load site settings:', error);
    }
  };

  const handleSiteSave = async () => {
    setSiteLoading(true);
    try {
      await siteSettingsAPI.update(siteSettings);
      if (siteSettings.siteName) {
        document.title = siteSettings.siteName;
        localStorage.setItem('site_name', siteSettings.siteName);
      }
      toast.success('Site settings saved!');
    } catch (error) {
      toast.error('Failed to save site settings');
    } finally {
      setSiteLoading(false);
    }
  };

  const handleWhatsAppSave = () => {
    setWhatsAppLoading(true);
    localStorage.setItem('whatsapp_settings', JSON.stringify(whatsAppSettings));
    setTimeout(() => {
      toast.success('WhatsApp settings saved!');
      setWhatsAppLoading(false);
    }, 500);
  };

  const togglePage = (page) => {
    setWhatsAppSettings((prev) => ({
      ...prev,
      pages: { ...prev.pages, [page]: !prev.pages[page] },
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(profileData);
      updateUser(response.data.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!/^[A-Z]/.test(passwordData.newPassword)) {
      toast.error('Password must start with a capital letter');
      return;
    }

    setPasswordLoading(true);

    try {
      await authAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const pageLabels = {
    dashboard: 'User Dashboard',
    newOrder: 'New Order',
    orders: 'Order History',
    services: 'Services',
    addFunds: 'Add Funds',
    notifications: 'Notifications',
    profile: 'Profile',
    adminDashboard: 'Admin Dashboard',
    adminOrders: 'Admin Orders',
    adminServices: 'Admin Services',
    adminUsers: 'Admin Users',
    adminSettings: 'Admin Settings',
  };

  return (
    <div className="fade-in max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HiOutlineCog className="w-7 h-7" /> Admin Settings
        </h1>
        <p className="text-gray-500 mt-1">Manage your account and platform settings</p>
      </div>

      {/* Site Settings */}
      <Card className="mb-6" title="Site Settings" subtitle="Change your platform name and branding">
        <div className="space-y-4">
          <Input
            label="Site Name"
            placeholder="e.g., Nawaz SMM"
            value={siteSettings.siteName}
            onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
          />
          <Input
            label="Site Tagline (optional)"
            placeholder="e.g., Best SMM Panel"
            value={siteSettings.siteTagline}
            onChange={(e) => setSiteSettings({ ...siteSettings, siteTagline: e.target.value })}
          />
          <Button onClick={handleSiteSave} loading={siteLoading}>
            <HiOutlineGlobe className="w-4 h-4 mr-2" /> Save Site Settings
          </Button>
        </div>
      </Card>

      {/* Admin Info */}
      <Card className="mb-6">
        <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl">
          <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-lg text-gray-900">{user?.name}</p>
            <p className="text-gray-500">@{user?.username}</p>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-indigo-500 text-white rounded">
              Administrator
            </span>
          </div>
        </div>
      </Card>

      {/* WhatsApp Settings */}
      <Card className="mb-6" title="WhatsApp Settings" subtitle="Configure WhatsApp button across your platform">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <HiOutlineChat className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">WhatsApp Button</p>
                <p className="text-sm text-gray-500">Show/hide floating WhatsApp button</p>
              </div>
            </div>
            <button
              onClick={() => setWhatsAppSettings((prev) => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                whatsAppSettings.enabled ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  whatsAppSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <Input
              label="WhatsApp Number (with country code)"
              placeholder="923435071757"
              helperText="Format: CountryCode + Number (no + or spaces)"
              value={whatsAppSettings.number}
              onChange={(e) => setWhatsAppSettings((prev) => ({ ...prev, number: e.target.value }))}
            />
            <p className="text-xs text-gray-400 mt-1">
              Preview: <a href={`https://wa.me/${whatsAppSettings.number}`} target="_blank" rel="noopener noreferrer" className="text-green-600 underline">wa.me/{whatsAppSettings.number}</a>
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-900 mb-3">Show WhatsApp on Pages</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(pageLabels).map(([key, label]) => (
                <label
                  key={key}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    whatsAppSettings.pages[key]
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={whatsAppSettings.pages[key]}
                    onChange={() => togglePage(key)}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button onClick={handleWhatsAppSave} loading={whatsAppLoading} className="bg-green-600 hover:bg-green-700">
            Save WhatsApp Settings
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Account Info">
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <Input
              label="Full Name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              required
            />
            <Input
              label="Username"
              value={profileData.username}
              onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
              required
            />
            <Input
              label="Email"
              value={user?.email}
              disabled
              helperText="Email cannot be changed"
            />
            <Button type="submit" loading={loading} className="w-full">
              <HiOutlineMail className="w-4 h-4 mr-2" /> Update Info
            </Button>
          </form>
        </Card>

        <Card title="Change Password">
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              required
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Create a password"
              helperText="Must start with a capital letter"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              required
            />
            <Button type="submit" loading={passwordLoading} className="w-full bg-red-600 hover:bg-red-700">
              <HiOutlineLockClosed className="w-4 h-4 mr-2" /> Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
