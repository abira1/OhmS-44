import React, { useState } from 'react';
import { XIcon, PhoneIcon, MailIcon, MessageSquareIcon, PlusIcon, UserPlusIcon, AwardIcon, StarIcon, EditIcon, SearchIcon, UsersIcon } from 'lucide-react';
import { useStudents } from '../../hooks/useFirebase';
import { Student, Permissions } from '../../types';
import SectionLoader from '../SectionLoader';
import { sortStudentsByRollNumber } from '../../utils/sortingUtils';
import { EnhancedAvatarImage } from '../ui/OptimizedImage';
import ImageUpload from '../ui/ImageUpload';
import { useStudentsSearch } from '../../hooks/useSearch';
import { RetroSearchInput } from '../ui/SearchInput';
import { HighlightedText } from '../ui/HighlightedText';
import { useAccessibility } from '../../hooks/useAccessibility';
interface ContactModalProps {
  student: Student;
  onClose: () => void;
  searchTerm?: string;
  getHighlightedValue?: (item: any, field: string) => string;
}
const ContactModal: React.FC<ContactModalProps> = ({
  student,
  onClose,
  searchTerm,
  getHighlightedValue
}) => {
  return <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl neu-shadow max-w-sm w-full p-6 relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 rounded-full neu-button">
          <XIcon className="h-5 w-5" />
        </button>
        <div className="text-center mb-6">
          <div className="relative mx-auto w-24 h-24 rounded-full mb-3 neu-shadow-sm">
            <EnhancedAvatarImage
              src={student.image}
              alt={student.name}
              size="xl"
              className="border-4 border-white dark:border-gray-700"
              fallbackInitials={student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            />
            {student.role === 'CR' && <div className="absolute -top-2 -right-2 bg-retro-yellow dark:bg-retro-blue text-black dark:text-white p-1 rounded-full neu-shadow-sm">
                <AwardIcon className="h-5 w-5" />
              </div>}
            {student.role === 'CO-CR' && <div className="absolute -top-2 -right-2 bg-retro-purple dark:bg-retro-teal text-white p-1 rounded-full neu-shadow-sm">
                <StarIcon className="h-5 w-5" />
              </div>}
          </div>
          <h3 className="text-xl font-bold dark:text-white">
            Contact {searchTerm && getHighlightedValue ? (
              <HighlightedText
                text={student.name}
                highlightedText={getHighlightedValue(student, 'name')}
              />
            ) : (
              student.name
            )}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Roll: {searchTerm && getHighlightedValue ? (
              <HighlightedText
                text={student.roll}
                highlightedText={getHighlightedValue(student, 'roll')}
              />
            ) : (
              student.roll
            )}
          </p>
          {student.role && student.role !== 'Regular' && <div className="mt-1">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${student.role === 'CR' ? 'bg-retro-yellow/20 text-retro-yellow dark:bg-retro-blue/20 dark:text-retro-blue' : 'bg-retro-purple/20 text-retro-purple dark:bg-retro-teal/20 dark:text-retro-teal'}`}>
                {student.role}
              </span>
            </div>}
        </div>
        <div className="space-y-4">
          <a href={`tel:${student.phone}`} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl neu-button">
            <div className="bg-navy-50 dark:bg-navy-900/40 p-3 rounded-xl mr-4 neu-shadow-sm">
              <PhoneIcon className="h-5 w-5 text-navy-500 dark:text-navy-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium dark:text-gray-200">Phone</p>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm && getHighlightedValue ? (
                  <HighlightedText
                    text={student.phone}
                    highlightedText={getHighlightedValue(student, 'phone')}
                  />
                ) : (
                  student.phone
                )}
              </p>
            </div>
          </a>
          <a href={`mailto:${student.email}`} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl neu-button">
            <div className="bg-navy-50 dark:bg-navy-900/40 p-3 rounded-xl mr-4 neu-shadow-sm">
              <MailIcon className="h-5 w-5 text-navy-500 dark:text-navy-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium dark:text-gray-200">Email</p>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm && getHighlightedValue ? (
                  <HighlightedText
                    text={student.email}
                    highlightedText={getHighlightedValue(student, 'email')}
                  />
                ) : (
                  student.email
                )}
              </p>
            </div>
          </a>
          <a href={`https://wa.me/${student.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-medium transition-colors neu-shadow">
            <MessageSquareIcon className="h-5 w-5" />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>;
};
interface AddClassmateModalProps {
  onClose: () => void;
  onAdd: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

interface EditClassmateModalProps {
  student: Student;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Student>) => Promise<void>;
}
const AddClassmateModal: React.FC<AddClassmateModalProps> = ({
  onClose,
  onAdd
}) => {
  const [formData, setFormData] = useState({
    name: '',
    roll: '',
    bloodGroup: '',
    phone: '',
    email: '',
    image: '',
    role: 'Regular' as Student['role']
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const roles = ['Regular', 'CR', 'CO-CR'];
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.roll.trim()) newErrors.roll = 'Roll number is required';
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
    } else if (!/^(https?:\/\/.+|data:image\/.+)/.test(formData.image)) {
      newErrors.image = 'Please enter a valid image URL or upload an image';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      // Simulate API call delay
      setTimeout(() => {
        onAdd(formData);
        setIsSubmitting(false);
        onClose();
      }, 500);
    }
  };

  return <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl neu-shadow max-w-lg w-full p-6 relative animate-fadeIn overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full neu-button">
          <XIcon className="h-5 w-5" />
        </button>
        <div className="text-center mb-6">
          <div className="bg-retro-purple dark:bg-retro-teal p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center neu-shadow">
            <UserPlusIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Add New Classmate
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Enter classmate details below
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="name">
                Full Name
              </label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 neu-shadow-inner ${errors.name ? 'border-red-500 dark:border-red-500' : ''}`} placeholder="Enter full name" />
              {errors.name && <p className="mt-1 text-red-500 text-xs">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="roll">
                Roll Number
              </label>
              <input type="text" id="roll" name="roll" value={formData.roll} onChange={handleChange} className={`w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 neu-shadow-inner ${errors.roll ? 'border-red-500 dark:border-red-500' : ''}`} placeholder="e.g. EEE2310" />
              {errors.roll && <p className="mt-1 text-red-500 text-xs">{errors.roll}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="bloodGroup">
                Blood Group
              </label>
              <select id="bloodGroup" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className={`w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 neu-shadow-inner ${errors.bloodGroup ? 'border-red-500 dark:border-red-500' : ''}`}>
                <option value="">Select Blood Group</option>
                {bloodGroups.map(group => <option key={group} value={group}>
                    {group}
                  </option>)}
              </select>
              {errors.bloodGroup && <p className="mt-1 text-red-500 text-xs">{errors.bloodGroup}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="role">
                Role
              </label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className={`w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 neu-shadow-inner ${errors.role ? 'border-red-500 dark:border-red-500' : ''}`}>
                {roles.map(role => <option key={role} value={role}>
                    {role}
                  </option>)}
              </select>
              {errors.role && <p className="mt-1 text-red-500 text-xs">{errors.role}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="phone">
                Phone Number
              </label>
              <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={`w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 neu-shadow-inner ${errors.phone ? 'border-red-500 dark:border-red-500' : ''}`} placeholder="e.g. +1 (555) 123-4567" />
              {errors.phone && <p className="mt-1 text-red-500 text-xs">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">
                Email Address
              </label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={`w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 neu-shadow-inner ${errors.email ? 'border-red-500 dark:border-red-500' : ''}`} placeholder="name@university.edu" />
              {errors.email && <p className="mt-1 text-red-500 text-xs">{errors.email}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Profile Image
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Image Upload Component */}
                <ImageUpload
                  value={formData.image}
                  onChange={(imageUrl) => {
                    setFormData(prev => ({ ...prev, image: imageUrl }));
                    if (errors.image) {
                      setErrors(prev => ({ ...prev, image: '' }));
                    }
                  }}
                  onUploadComplete={() => {
                    // Image uploaded successfully
                  }}
                  size="xl"
                  placeholder="Upload or drag image here"
                  className="flex-shrink-0"
                  studentName={formData.name}
                  useCloudUpload={true}
                />

                {/* URL Input as Alternative */}
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Or paste image URL
                  </label>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 neu-shadow-inner ${errors.image ? 'border-red-500 dark:border-red-500' : ''}`}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              {errors.image && <p className="mt-2 text-red-500 text-xs">{errors.image}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl neu-button-secondary text-gray-700 dark:text-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-3 rounded-xl neu-button-primary bg-retro-purple dark:bg-retro-teal text-white flex items-center justify-center">
              {isSubmitting ? <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> : null}
              Add Classmate
            </button>
          </div>
        </form>
      </div>
    </div>;
};

const EditClassmateModal: React.FC<EditClassmateModalProps> = ({
  student,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: student.name,
    roll: student.roll,
    bloodGroup: student.bloodGroup,
    phone: student.phone,
    email: student.email,
    image: student.image,
    role: student.role
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const roles = ['Regular', 'CR', 'CO-CR'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.roll.trim()) newErrors.roll = 'Roll number is required';
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
    } else if (!/^(https?:\/\/.+|data:image\/.+)/.test(formData.image)) {
      newErrors.image = 'Please enter a valid image URL or upload an image';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        // Create updates object with only changed fields
        const updates: Partial<Student> = {};
        if (formData.name !== student.name) updates.name = formData.name;
        if (formData.roll !== student.roll) updates.roll = formData.roll;
        if (formData.bloodGroup !== student.bloodGroup) updates.bloodGroup = formData.bloodGroup;
        if (formData.phone !== student.phone) updates.phone = formData.phone;
        if (formData.email !== student.email) updates.email = formData.email;
        if (formData.image !== student.image) updates.image = formData.image;
        if (formData.role !== student.role) updates.role = formData.role;

        // Always include updatedAt
        updates.updatedAt = Date.now();

        await onSave(student.id, updates);

        // Show success feedback
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1000);

      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'Failed to update classmate');
      } finally {
        setIsSubmitting(false);
      }
    }
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl neu-shadow max-w-lg w-full p-6 relative animate-fadeIn overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full neu-button">
          <XIcon className="h-5 w-5" />
        </button>
        <div className="text-center mb-6">
          <div className="bg-retro-purple dark:bg-retro-teal p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center neu-shadow">
            <EditIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Edit Classmate
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Update {student.name}'s information
          </p>
        </div>

        {/* Success Message */}
        {isSuccess && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl">
            <p className="text-green-700 dark:text-green-300 text-sm font-medium">
              ✅ Classmate information updated successfully!
            </p>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl">
            <p className="text-red-700 dark:text-red-300 text-sm font-medium">
              ❌ {submitError}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="edit-name">
                Full Name
              </label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 neu-shadow-inner ${errors.name ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="Enter full name"
              />
              {errors.name && <p className="mt-1 text-red-500 text-xs">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="edit-roll">
                Roll Number
              </label>
              <input
                type="text"
                id="edit-roll"
                name="roll"
                value={formData.roll}
                onChange={handleChange}
                className={`w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 neu-shadow-inner ${errors.roll ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="e.g. EEE2310"
              />
              {errors.roll && <p className="mt-1 text-red-500 text-xs">{errors.roll}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="edit-bloodGroup">
                Blood Group
              </label>
              <select
                id="edit-bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className={`w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 neu-shadow-inner ${errors.bloodGroup ? 'border-red-500 dark:border-red-500' : ''}`}
              >
                <option value="">Select Blood Group</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
              {errors.bloodGroup && <p className="mt-1 text-red-500 text-xs">{errors.bloodGroup}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="edit-role">
                Role
              </label>
              <select
                id="edit-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 neu-shadow-inner ${errors.role ? 'border-red-500 dark:border-red-500' : ''}`}
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {errors.role && <p className="mt-1 text-red-500 text-xs">{errors.role}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="edit-phone">
                Phone Number
              </label>
              <input
                type="text"
                id="edit-phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 neu-shadow-inner ${errors.phone ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="e.g. +1 (555) 123-4567"
              />
              {errors.phone && <p className="mt-1 text-red-500 text-xs">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="edit-email">
                Email Address
              </label>
              <input
                type="email"
                id="edit-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 neu-shadow-inner ${errors.email ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="name@university.edu"
              />
              {errors.email && <p className="mt-1 text-red-500 text-xs">{errors.email}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Profile Image
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Image Upload Component */}
                <ImageUpload
                  value={formData.image}
                  onChange={(imageUrl) => {
                    setFormData(prev => ({ ...prev, image: imageUrl }));
                    if (errors.image) {
                      setErrors(prev => ({ ...prev, image: '' }));
                    }
                  }}
                  onUploadComplete={() => {
                    // Image uploaded successfully
                  }}
                  size="xl"
                  placeholder="Upload or drag image here"
                  className="flex-shrink-0"
                  studentName={formData.name}
                  useCloudUpload={true}
                />

                {/* URL Input as Alternative */}
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Or paste image URL
                  </label>
                  <input
                    type="url"
                    id="edit-image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 neu-shadow-inner ${errors.image ? 'border-red-500 dark:border-red-500' : ''}`}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              {errors.image && <p className="mt-2 text-red-500 text-xs">{errors.image}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl neu-button-secondary text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-3 rounded-xl neu-button-primary bg-retro-purple dark:bg-retro-teal text-white flex items-center justify-center"
            >
              {isSubmitting ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : null}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
const ClassmateCard: React.FC<{
  student: Student;
  onClick: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
  searchTerm?: string;
  getHighlightedValue?: (item: any, field: string) => string;
}> = ({
  student,
  onClick,
  onEdit,
  canEdit = false,
  searchTerm,
  getHighlightedValue
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when edit button is clicked
    if ((e.target as HTMLElement).closest('.edit-button')) {
      return;
    }
    onClick();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  return <div className={`classmate-card p-5 cursor-pointer hover:scale-[1.02] transition-all duration-200 rounded-2xl neu-shadow border-2 relative ${student.role === 'CR' ? 'bg-retro-yellow/10 dark:bg-retro-blue/10 border-retro-yellow dark:border-retro-blue' : student.role === 'CO-CR' ? 'bg-retro-purple/10 dark:bg-retro-teal/10 border-retro-purple dark:border-retro-teal' : 'bg-white dark:bg-gray-800/90 border-black dark:border-gray-700'}`} onClick={handleCardClick}>
      {canEdit && (
        <button
          onClick={handleEditClick}
          className="edit-button absolute top-3 right-3 p-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-full neu-shadow-sm transition-colors"
          title="Edit classmate"
        >
          <EditIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </button>
      )}


      <div className="flex items-center space-x-4">
        <div className="relative w-16 h-16 rounded-full neu-shadow-sm">
          <EnhancedAvatarImage
            src={student.image}
            alt={student.name}
            size="lg"
            className="border-2 border-white dark:border-gray-700"
            fallbackInitials={student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          />
          {student.role === 'CR' && <div className="absolute -top-2 -right-2 bg-retro-yellow dark:bg-retro-blue text-black dark:text-white p-1 rounded-full neu-shadow-sm">
              <AwardIcon className="h-4 w-4" />
            </div>}
          {student.role === 'CO-CR' && <div className="absolute -top-2 -right-2 bg-retro-purple dark:bg-retro-teal text-white p-1 rounded-full neu-shadow-sm">
              <StarIcon className="h-4 w-4" />
            </div>}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg dark:text-gray-100">
            {searchTerm && getHighlightedValue ? (
              <HighlightedText
                text={student.name}
                highlightedText={getHighlightedValue(student, 'name')}
              />
            ) : (
              student.name
            )}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Roll: {searchTerm && getHighlightedValue ? (
              <HighlightedText
                text={student.roll}
                highlightedText={getHighlightedValue(student, 'roll')}
              />
            ) : (
              student.roll
            )}
          </p>
          {student.role && student.role !== 'Regular' && (
            <span className={`text-xs font-medium ${student.role === 'CR' ? 'text-retro-yellow dark:text-retro-blue' : 'text-retro-purple dark:text-retro-teal'}`}>
              {searchTerm && getHighlightedValue ? (
                <HighlightedText
                  text={student.role}
                  highlightedText={getHighlightedValue(student, 'role')}
                />
              ) : (
                student.role
              )}
            </span>
          )}
        </div>
        <div className="bg-navy-50 dark:bg-navy-900/30 px-3 py-1.5 rounded-lg neu-shadow-sm">
          <span className="text-sm font-medium text-navy-600 dark:text-navy-300">
            {searchTerm && getHighlightedValue ? (
              <HighlightedText
                text={student.bloodGroup}
                highlightedText={getHighlightedValue(student, 'bloodGroup')}
              />
            ) : (
              student.bloodGroup
            )}
          </span>
        </div>
      </div>
    </div>;
};
interface ClassmatesSectionProps {
  isAdmin: boolean;
  permissions: Permissions;
}

const ClassmatesSection: React.FC<ClassmatesSectionProps> = ({ permissions }) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { students, loading, error, createStudent, updateStudent } = useStudents();
  const { announceToScreenReader } = useAccessibility();

  // Search functionality
  const {
    filteredItems: searchFilteredStudents,
    isSearching,
    hasSearchTerm,
    getHighlightedValue
  } = useStudentsSearch(students || [], searchTerm);
  const handleAddClassmate = async (newStudent: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await createStudent(newStudent);
      if (result.success) {
        setShowAddModal(false);
      } else {
        console.error('Failed to create student:', result.error);
      }
    } catch (error) {
      console.error('Error creating student:', error);
    }
  };

  const handleEditClassmate = async (id: string, updates: Partial<Student>) => {
    try {
      const result = await updateStudent(id, updates);
      if (result.success) {
        // Don't close the modal here - let the modal handle success feedback
        // setEditingStudent(null);
      } else {
        throw new Error(result.error || 'Failed to update classmate');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      throw error; // Re-throw so the modal can handle it
    }
  };

  if (loading) {
    return <div className="space-y-6">
      <SectionLoader
        section="classmates"
        message="Loading student directory and contact information..."
        size="large"
      />
    </div>;
  }

  if (error) {
    return <div className="space-y-6">
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-red-600 dark:text-red-400">Error loading classmates: {error}</div>
      </div>
    </div>;
  }

  // Empty state when no students exist
  if (students.length === 0) {
    return <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Classmates
        </h2>
        {permissions.canCreateStudents && (
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-retro-purple hover:bg-retro-purple/90 dark:bg-retro-teal dark:hover:bg-retro-teal/90 text-white py-2 px-4 rounded-xl font-medium transition-colors neu-shadow">
            <PlusIcon className="h-5 w-5" />
            Add Classmate
          </button>
        )}
      </div>

      <div className="neu-card p-8 sm:p-12 text-center">
        <div className="bg-retro-yellow/20 dark:bg-retro-blue/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 neu-shadow-sm">
          <UserPlusIcon className="h-10 w-10 text-retro-purple dark:text-retro-teal" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          No Classmates Added Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {permissions.canCreateStudents
            ? "Start building your class directory by adding your first classmate. Include their contact information, roll number, and role."
            : "No classmates have been added to the directory yet. The student directory will appear here once it's been set up."
          }
        </p>
        {permissions.canCreateStudents && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-retro-purple hover:bg-retro-purple/90 dark:bg-retro-teal dark:hover:bg-retro-teal/90 text-white py-3 px-6 rounded-xl font-medium transition-colors neu-shadow"
          >
            <UserPlusIcon className="h-5 w-5" />
            Add Your First Classmate
          </button>
        )}
      </div>

      {permissions.canCreateStudents && showAddModal && <AddClassmateModal onClose={() => setShowAddModal(false)} onAdd={handleAddClassmate} />}
    </div>;
  }

  return <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-vhs flex items-center">
            <UsersIcon className="mr-2 h-6 w-6 sm:h-8 sm:w-8 text-retro-purple dark:text-retro-teal" />
            Classmates
          </h2>

          {permissions.canCreateStudents && (
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-retro-purple hover:bg-retro-purple/90 dark:bg-retro-teal dark:hover:bg-retro-teal/90 text-white py-2 px-4 rounded-xl font-medium transition-colors neu-shadow">
              <PlusIcon className="h-5 w-5" />
              Add Classmate
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="w-full">
          <RetroSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search classmates by name, roll number, blood group, or contact info..."
            isLoading={isSearching}
            resultsCount={hasSearchTerm ? searchFilteredStudents.length : undefined}
            aria-label="Search classmates"
            aria-describedby="classmates-search-help"
            onClear={() => {
              setSearchTerm('');
              announceToScreenReader('Search cleared, showing all classmates');
            }}
          />
          <div id="classmates-search-help" className="sr-only">
            Search through classmate names, roll numbers, blood groups, phone numbers, emails, and roles. Use the clear button or press Escape to reset.
          </div>
        </div>
      </div>
      {/* Students Display */}
      {(() => {
        // Use search-filtered students if there's a search term
        const displayStudents = hasSearchTerm ? searchFilteredStudents : students;
        const sortedStudents = sortStudentsByRollNumber(displayStudents);

        return sortedStudents.length === 0 ? (
          <div className="neu-card p-8 sm:p-12 text-center">
            <div className="bg-retro-yellow/20 dark:bg-retro-blue/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 neu-shadow-sm">
              {hasSearchTerm ? (
                <SearchIcon className="h-10 w-10 text-retro-purple dark:text-retro-teal" />
              ) : (
                <UsersIcon className="h-10 w-10 text-retro-purple dark:text-retro-teal" />
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              {hasSearchTerm ? 'No Matching Classmates Found' : 'No Classmates Available'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {hasSearchTerm ? (
                <>
                  No classmates match your search for "<span className="font-medium text-retro-purple dark:text-retro-teal">{searchTerm}</span>".
                  Try adjusting your search terms or check the spelling.
                </>
              ) : permissions.canCreateStudents ? (
                "Start building your class directory by adding your first classmate. Include their contact information, roll number, and role."
              ) : (
                "No classmates have been added to the directory yet. The student directory will appear here once it's been set up."
              )}
            </p>
            {hasSearchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  announceToScreenReader('Search cleared, showing all classmates');
                }}
                className="retro-btn bg-retro-purple text-white hover:bg-retro-purple/80 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedStudents.map(student => (
              <ClassmateCard
                key={student.id}
                student={student}
                onClick={() => setSelectedStudent(student)}
                onEdit={() => setEditingStudent(student)}
                canEdit={permissions.canEditStudents}
                searchTerm={hasSearchTerm ? searchTerm : undefined}
                getHighlightedValue={getHighlightedValue}
              />
            ))}
          </div>
        );
      })()}
      {selectedStudent && (
        <ContactModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          searchTerm={hasSearchTerm ? searchTerm : undefined}
          getHighlightedValue={getHighlightedValue}
        />
      )}
      {permissions.canCreateStudents && showAddModal && <AddClassmateModal onClose={() => setShowAddModal(false)} onAdd={handleAddClassmate} />}
      {permissions.canEditStudents && editingStudent && <EditClassmateModal student={editingStudent} onClose={() => setEditingStudent(null)} onSave={handleEditClassmate} />}
    </div>;
};
export default ClassmatesSection;