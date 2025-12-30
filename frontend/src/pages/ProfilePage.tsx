import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserProfile,
  updateUserProfile,
  createUserProfile,
  validators,
} from '@/lib/firestore/users';
import { UserProfile } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Phone, MapPin, Building2, Pencil, X, Check, Mail, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// =====================================================
// Types
// =====================================================

type EditSection = 'profile' | 'contact' | 'address' | 'bank' | null;

interface FormErrors {
  [key: string]: string;
}

// =====================================================
// Component
// =====================================================

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editSection, setEditSection] = useState<EditSection>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // フォームの状態
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    postalCode: '',
    prefecture: '',
    city: '',
    street: '',
    building: '',
    bankName: '',
    bankCode: '',
    branchName: '',
    branchCode: '',
    accountType: 'ordinary' as 'ordinary' | 'checking',
    accountNumber: '',
    accountHolder: '',
  });

  // プロフィールの取得
  useEffect(() => {
    async function fetchProfile() {
      if (!user?.uid) return;

      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          // emailがない場合は補完する（不完全なドキュメントの修正）
          if (!userProfile.email && user.email) {
            await updateUserProfile(user.uid, {}, { email: user.email, photoURL: user.photoURL });
            userProfile.email = user.email;
            userProfile.photoURL = user.photoURL;
          }
          setProfile(userProfile);
          // フォームデータを初期化
          setFormData({
            displayName: userProfile.displayName || '',
            phone: userProfile.phone || '',
            postalCode: userProfile.address?.postalCode || '',
            prefecture: userProfile.address?.prefecture || '',
            city: userProfile.address?.city || '',
            street: userProfile.address?.street || '',
            building: userProfile.address?.building || '',
            bankName: userProfile.bankAccount?.bankName || '',
            bankCode: userProfile.bankAccount?.bankCode || '',
            branchName: userProfile.bankAccount?.branchName || '',
            branchCode: userProfile.bankAccount?.branchCode || '',
            accountType: userProfile.bankAccount?.accountType || 'ordinary',
            accountNumber: userProfile.bankAccount?.accountNumber || '',
            accountHolder: userProfile.bankAccount?.accountHolder || '',
          });
        } else {
          // 新規ユーザーの場合、Firestoreに初期ドキュメントを作成
          const newProfile = await createUserProfile(user.uid, {
            email: user.email || '',
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
          setProfile(newProfile);
          setFormData((prev) => ({
            ...prev,
            displayName: newProfile.displayName || '',
          }));
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  // 編集を開始
  const startEdit = (section: EditSection) => {
    setEditSection(section);
    setFormErrors({});
  };

  // 編集をキャンセル
  const cancelEdit = () => {
    setEditSection(null);
    setFormErrors({});
    // フォームをリセット
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        phone: profile.phone || '',
        postalCode: profile.address?.postalCode || '',
        prefecture: profile.address?.prefecture || '',
        city: profile.address?.city || '',
        street: profile.address?.street || '',
        building: profile.address?.building || '',
        bankName: profile.bankAccount?.bankName || '',
        bankCode: profile.bankAccount?.bankCode || '',
        branchName: profile.bankAccount?.branchName || '',
        branchCode: profile.bankAccount?.branchCode || '',
        accountType: profile.bankAccount?.accountType || 'ordinary',
        accountNumber: profile.bankAccount?.accountNumber || '',
        accountHolder: profile.bankAccount?.accountHolder || '',
      });
    }
  };

  // バリデーション
  const validateForm = (section: EditSection): boolean => {
    const errors: FormErrors = {};

    if (section === 'contact') {
      if (formData.phone && !validators.isValidPhone(formData.phone)) {
        errors.phone = 'Invalid phone number format';
      }
    }

    if (section === 'address') {
      if (formData.postalCode && !validators.isValidPostalCode(formData.postalCode)) {
        errors.postalCode = 'Invalid postal code format (e.g., 123-4567)';
      }
      // Required field check when entering address
      if (formData.postalCode || formData.prefecture || formData.city || formData.street) {
        if (!formData.postalCode) errors.postalCode = 'Please enter postal code';
        if (!formData.prefecture) errors.prefecture = 'Please enter prefecture';
        if (!formData.city) errors.city = 'Please enter city';
        if (!formData.street) errors.street = 'Please enter street address';
      }
    }

    if (section === 'bank') {
      // Required field check when entering bank account
      if (
        formData.bankName ||
        formData.bankCode ||
        formData.branchName ||
        formData.branchCode ||
        formData.accountNumber ||
        formData.accountHolder
      ) {
        if (!formData.bankName) errors.bankName = 'Please enter bank name';
        if (!formData.bankCode) {
          errors.bankCode = 'Please enter bank code';
        } else if (!validators.isValidBankCode(formData.bankCode)) {
          errors.bankCode = 'Bank code must be 4 digits';
        }
        if (!formData.branchName) errors.branchName = 'Please enter branch name';
        if (!formData.branchCode) {
          errors.branchCode = 'Please enter branch code';
        } else if (!validators.isValidBranchCode(formData.branchCode)) {
          errors.branchCode = 'Branch code must be 3 digits';
        }
        if (!formData.accountNumber) {
          errors.accountNumber = 'Please enter account number';
        } else if (!validators.isValidAccountNumber(formData.accountNumber)) {
          errors.accountNumber = 'Account number must be 7 digits';
        }
        if (!formData.accountHolder) {
          errors.accountHolder = 'Please enter account holder name';
        } else if (!validators.isValidAccountHolder(formData.accountHolder)) {
          errors.accountHolder = 'Account holder name must be in full-width katakana';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 保存処理
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !editSection) return;

    if (!validateForm(editSection)) return;

    setSaving(true);
    try {
      if (editSection === 'profile') {
        await updateUserProfile(user.uid, {
          displayName: formData.displayName || null,
        });
      } else if (editSection === 'contact') {
        await updateUserProfile(user.uid, {
          phone: formData.phone || null,
        });
      } else if (editSection === 'address') {
        const hasAddress =
          formData.postalCode && formData.prefecture && formData.city && formData.street;
        await updateUserProfile(user.uid, {
          address: hasAddress
            ? {
                postalCode: formData.postalCode,
                prefecture: formData.prefecture,
                city: formData.city,
                street: formData.street,
                building: formData.building || null,
              }
            : null,
        });
      } else if (editSection === 'bank') {
        const hasBank =
          formData.bankName &&
          formData.bankCode &&
          formData.branchName &&
          formData.branchCode &&
          formData.accountNumber &&
          formData.accountHolder;
        await updateUserProfile(user.uid, {
          bankAccount: hasBank
            ? {
                bankName: formData.bankName,
                bankCode: formData.bankCode,
                branchName: formData.branchName,
                branchCode: formData.branchCode,
                accountType: formData.accountType,
                accountNumber: formData.accountNumber,
                accountHolder: formData.accountHolder,
              }
            : null,
        });
      }

      // プロフィールを再取得
      const updatedProfile = await getUserProfile(user.uid);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }

      setEditSection(null);
    } catch (error) {
      console.error('Save error:', error);
      setFormErrors({ submit: 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // ローディング表示
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-500" />
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <section>
        <h1 className="font-display text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-gray-500">View and edit your account information</p>
      </section>

      {/* Profile Section */}
      <ProfileSection
        title="Profile"
        icon={<User className="h-5 w-5" style={{ color: '#f29801' }} />}
        isEditing={editSection === 'profile'}
        onEdit={() => startEdit('profile')}
        onCancel={cancelEdit}
        onSave={handleSave}
        saving={saving}
        error={formErrors.submit}
      >
        {editSection === 'profile' ? (
          <div className="space-y-4">
            <Input
              label="Display Name"
              value={formData.displayName}
              onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
              placeholder="John Doe"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <InfoRow label="Display Name" value={profile?.displayName || 'Not Set'} />
            <InfoRow
              label="Email Address"
              value={profile?.email || ''}
              icon={<Mail className="h-4 w-4 text-gray-400" />}
            />
          </div>
        )}
      </ProfileSection>

      {/* Contact Section */}
      <ProfileSection
        title="Contact"
        icon={<Phone className="h-5 w-5" style={{ color: '#f29801' }} />}
        isEditing={editSection === 'contact'}
        onEdit={() => startEdit('contact')}
        onCancel={cancelEdit}
        onSave={handleSave}
        saving={saving}
        error={formErrors.submit}
      >
        {editSection === 'contact' ? (
          <div className="space-y-4">
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="090-1234-5678"
              error={formErrors.phone}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <InfoRow label="Phone Number" value={profile?.phone || 'Not Set'} />
          </div>
        )}
      </ProfileSection>

      {/* Address Section */}
      <ProfileSection
        title="Address"
        icon={<MapPin className="h-5 w-5" style={{ color: '#f29801' }} />}
        isEditing={editSection === 'address'}
        onEdit={() => startEdit('address')}
        onCancel={cancelEdit}
        onSave={handleSave}
        saving={saving}
        error={formErrors.submit}
      >
        {editSection === 'address' ? (
          <div className="space-y-4">
            <Input
              label="Postal Code"
              value={formData.postalCode}
              onChange={(e) => setFormData((prev) => ({ ...prev, postalCode: e.target.value }))}
              placeholder="123-4567"
              error={formErrors.postalCode}
            />
            <Input
              label="Prefecture"
              value={formData.prefecture}
              onChange={(e) => setFormData((prev) => ({ ...prev, prefecture: e.target.value }))}
              placeholder="Tokyo"
              error={formErrors.prefecture}
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="Shibuya"
              error={formErrors.city}
            />
            <Input
              label="Street Address"
              value={formData.street}
              onChange={(e) => setFormData((prev) => ({ ...prev, street: e.target.value }))}
              placeholder="1-2-3"
              error={formErrors.street}
            />
            <Input
              label="Building Name / Room Number"
              value={formData.building}
              onChange={(e) => setFormData((prev) => ({ ...prev, building: e.target.value }))}
              placeholder="Building 101"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {profile?.address ? (
              <>
                <InfoRow label="Postal Code" value={profile.address.postalCode} />
                <InfoRow
                  label="Address"
                  value={`${profile.address.prefecture}${profile.address.city}${profile.address.street}${profile.address.building ? ` ${profile.address.building}` : ''}`}
                />
              </>
            ) : (
              <InfoRow label="Address" value="Not Set" isEmpty={true} />
            )}
          </div>
        )}
      </ProfileSection>

      {/* Bank Account Section */}
      <ProfileSection
        title="Bank Account"
        icon={<Building2 className="h-5 w-5" style={{ color: '#f29801' }} />}
        isEditing={editSection === 'bank'}
        onEdit={() => startEdit('bank')}
        onCancel={cancelEdit}
        onSave={handleSave}
        saving={saving}
        error={formErrors.submit}
      >
        {editSection === 'bank' ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Bank Name"
                value={formData.bankName}
                onChange={(e) => setFormData((prev) => ({ ...prev, bankName: e.target.value }))}
                placeholder="Mizuho Bank"
                error={formErrors.bankName}
              />
              <Input
                label="Bank Code"
                value={formData.bankCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, bankCode: e.target.value }))}
                placeholder="0001"
                error={formErrors.bankCode}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Branch Name"
                value={formData.branchName}
                onChange={(e) => setFormData((prev) => ({ ...prev, branchName: e.target.value }))}
                placeholder="Shibuya Branch"
                error={formErrors.branchName}
              />
              <Input
                label="Branch Code"
                value={formData.branchCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, branchCode: e.target.value }))}
                placeholder="001"
                error={formErrors.branchCode}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Account Type</label>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="accountType"
                    value="ordinary"
                    checked={formData.accountType === 'ordinary'}
                    onChange={() => setFormData((prev) => ({ ...prev, accountType: 'ordinary' }))}
                    className="h-4 w-4 text-primary-500"
                  />
                  <span className="text-sm text-gray-700">Ordinary</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="accountType"
                    value="checking"
                    checked={formData.accountType === 'checking'}
                    onChange={() => setFormData((prev) => ({ ...prev, accountType: 'checking' }))}
                    className="h-4 w-4 text-primary-500"
                  />
                  <span className="text-sm text-gray-700">Checking</span>
                </label>
              </div>
            </div>
            <Input
              label="Account Number"
              value={formData.accountNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
              placeholder="1234567"
              error={formErrors.accountNumber}
            />
            <Input
              label="Account Holder (Katakana)"
              value={formData.accountHolder}
              onChange={(e) => setFormData((prev) => ({ ...prev, accountHolder: e.target.value }))}
              placeholder="ヤマダ　タロウ"
              error={formErrors.accountHolder}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {profile?.bankAccount ? (
              <>
                <InfoRow
                  label="Bank"
                  value={`${profile.bankAccount.bankName} (${profile.bankAccount.bankCode})`}
                />
                <InfoRow
                  label="Branch"
                  value={`${profile.bankAccount.branchName} (${profile.bankAccount.branchCode})`}
                />
                <InfoRow
                  label="Account"
                  value={`${profile.bankAccount.accountType === 'ordinary' ? 'Ordinary' : 'Checking'} ${profile.bankAccount.accountNumber}`}
                />
                <InfoRow label="Account Holder" value={profile.bankAccount.accountHolder} />
              </>
            ) : (
              <InfoRow label="Bank Account" value="Not Set" isEmpty={true} />
            )}
          </div>
        )}
      </ProfileSection>
    </div>
  );
}

// =====================================================
// Sub Components
// =====================================================

interface ProfileSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (e: FormEvent) => void;
  saving: boolean;
  error?: string;
}

function ProfileSection({
  title,
  icon,
  children,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  saving,
  error,
}: ProfileSectionProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: '#ffefd4' }}
          >
            {icon}
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit</span>
          </button>
        )}
      </div>

      <div className="pt-4">
        {isEditing ? (
          <form onSubmit={onSave}>
            {children}
            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
                <X className="mr-1.5 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                <Check className="mr-1.5 h-4 w-4" />
                Save
              </Button>
            </div>
          </form>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  isEmpty?: boolean;
}

function InfoRow({ label, value, icon, isEmpty }: InfoRowProps) {
  // Use isEmpty prop to handle translation extension string changes
  // Or consider empty if value is empty string or null
  const isNotSet = isEmpty !== undefined ? isEmpty : !value || value.trim() === '';
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        {icon}
        <span className={cn('text-sm font-medium', isNotSet ? 'text-gray-400' : 'text-gray-900')}>
          {value || 'Not Set'}
        </span>
        {!isNotSet && <ChevronRight className="h-4 w-4 text-gray-300" />}
      </div>
    </div>
  );
}
