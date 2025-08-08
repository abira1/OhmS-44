import React, { useState } from 'react';
import { BellIcon, PlusIcon, XIcon } from 'lucide-react';
import { useNotices } from '../../hooks/useFirebase';
import { Notice } from '../../types/database';
import { Permissions } from '../../types';
import SectionLoader from '../SectionLoader';
import { NoticeInteractionWrapper } from '../ui/NoticeInteractionWrapper';
interface NoticeSectionProps {
  permissions: Permissions;
}

const NoticeSection: React.FC<NoticeSectionProps> = ({ permissions }) => {
  const { notices, loading, error, createNotice } = useNotices();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);
  const [expandedNotices, setExpandedNotices] = useState<Set<string>>(new Set());

  const toggleNoticeExpansion = (noticeId: string) => {
    setExpandedNotices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noticeId)) {
        newSet.delete(noticeId);
      } else {
        newSet.add(noticeId);
      }
      return newSet;
    });
  };

  const isNoticeExpanded = (noticeId: string) => expandedNotices.has(noticeId);

  const [newNotice, setNewNotice] = useState<{
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'general' | 'academic' | 'event' | 'emergency';
    targetAudience: 'all' | 'students' | 'teachers' | string[];
  }>({
    title: '',
    content: '',
    priority: 'medium',
    category: 'general',
    targetAudience: 'all'
  });
  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'> = {
        title: newNotice.title,
        content: newNotice.content,
        priority: newNotice.priority,
        category: newNotice.category,
        createdBy: 'admin', // In real app, this would come from auth context
        isActive: true,
        targetAudience: newNotice.targetAudience,
        likeCount: 0,
        commentCount: 0
      };

      const result = await createNotice(noticeData);
      if (result.success) {
        setNewNotice({
          title: '',
          content: '',
          priority: 'medium' as const,
          category: 'general' as const,
          targetAudience: 'all' as const
        });
        setShowAddForm(false);
      } else {
        console.error('Failed to create notice:', result.error);
      }
    } catch (error) {
      console.error('Error creating notice:', error);
    }
  };


  if (loading) {
    return <div className="space-y-6">
      <SectionLoader
        section="notices"
        message="Loading announcements and important updates..."
        size="large"
      />
    </div>;
  }

  if (error) {
    return <div className="space-y-6">
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-red-600 dark:text-red-400">Error loading notices: {error}</div>
      </div>
    </div>;
  }

  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl sm:text-3xl font-vhs flex items-center">
          <BellIcon className="mr-2 h-6 w-6 sm:h-8 sm:w-8 text-retro-purple dark:text-retro-teal" />
          Notice Board
        </h2>
        {permissions.canCreateNotices && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="retro-btn bg-retro-yellow dark:bg-retro-blue text-black dark:text-white flex items-center">
            {showAddForm ? <XIcon className="h-4 w-4 mr-1" /> : <PlusIcon className="h-4 w-4 mr-1" />}
            {showAddForm ? 'Cancel' : 'Add Notice'}
          </button>
        )}
      </div>
      {permissions.canCreateNotices && showAddForm && <div className="neu-card p-4 sm:p-6">
          <h3 className="text-xl font-vhs mb-4">Add New Notice</h3>
          <form onSubmit={handleAddNotice} className="space-y-4">
            <div>
              <label className="block text-sm font-vhs mb-1">Title</label>
              <input
                type="text"
                value={newNotice.title}
                onChange={e => setNewNotice({
                  ...newNotice,
                  title: e.target.value
                })}
                required
                placeholder="Notice Title"
                className="w-full p-2 border-2 border-black dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 neu-shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-vhs mb-1">Content</label>
              <textarea
                value={newNotice.content}
                onChange={e => setNewNotice({
                  ...newNotice,
                  content: e.target.value
                })}
                required
                placeholder="Notice Content"
                rows={4}
                className="w-full p-2 border-2 border-black dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 neu-shadow-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-vhs mb-1">Priority</label>
                <select
                  value={newNotice.priority}
                  onChange={e => setNewNotice({
                    ...newNotice,
                    priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent'
                  })}
                  className="w-full p-2 border-2 border-black dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 neu-shadow-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-vhs mb-1">Category</label>
                <select
                  value={newNotice.category}
                  onChange={e => setNewNotice({
                    ...newNotice,
                    category: e.target.value as 'general' | 'academic' | 'event' | 'emergency'
                  })}
                  className="w-full p-2 border-2 border-black dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 neu-shadow-sm"
                >
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="event">Event</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>
            <button type="submit" className="retro-btn bg-retro-green dark:bg-retro-teal text-black dark:text-white">
              Post Notice
            </button>
          </form>
        </div>}
      <div className="space-y-4">
        {(notices || []).length === 0 ? (
          <div className="neu-card p-8 sm:p-12 text-center">
            <div className="bg-retro-yellow/20 dark:bg-retro-blue/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 neu-shadow-sm">
              <BellIcon className="h-10 w-10 text-retro-purple dark:text-retro-teal" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              No Notices Posted Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {permissions.canCreateNotices
                ? "Stay tuned for important announcements and updates. New notices will appear here when they are posted."
                : "No notices have been posted yet. Important announcements and updates will appear here when available."
              }
            </p>
            {permissions.canCreateNotices && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 bg-retro-purple hover:bg-retro-purple/90 dark:bg-retro-teal dark:hover:bg-retro-teal/90 text-white py-3 px-6 rounded-xl font-medium transition-colors neu-shadow"
              >
                <PlusIcon className="h-5 w-5" />
                Post First Notice
              </button>
            )}
          </div>
        ) : (
          (notices || []).map(notice => {
            const isExpanded = isNoticeExpanded(notice.id);
            const content = notice.content || '';
            const contentPreview = content.length > 100 ?
              content.substring(0, 100) + '...' :
              content;

            return (
              <div
                key={notice.id}
                className="neu-card p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                onClick={() => toggleNoticeExpansion(notice.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-md font-vhs ${
                        notice.priority === 'urgent' ? 'bg-red-500 text-white' :
                        notice.priority === 'high' ? 'bg-orange-500 text-white' :
                        notice.priority === 'medium' ? 'bg-yellow-500 text-black' :
                        'bg-green-500 text-white'
                      }`}>
                        {(notice.priority || 'medium').toUpperCase()}
                      </span>
                      <span className="text-xs bg-retro-purple/20 dark:bg-retro-teal/20 text-retro-purple dark:text-retro-teal px-2 py-1 rounded-md font-vhs">
                        {notice.category || 'general'}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-vhs text-retro-purple dark:text-retro-teal mb-2">
                      {notice.title || 'Untitled Notice'}
                    </h3>
                  </div>
                  <span className="text-xs bg-retro-yellow dark:bg-retro-blue text-black dark:text-white px-2 py-1 rounded-md font-vhs">
                    {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : 'No date'}
                  </span>
                </div>

                {/* Content with expand/collapse */}
                <div className="mb-4">
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    {isExpanded ? content : contentPreview}
                  </p>
                  {content.length > 100 && !isExpanded && (
                    <span className="text-retro-purple dark:text-retro-teal font-vhs text-sm mt-2 block">
                      Click to read more...
                    </span>
                  )}
                </div>

                {/* Compact stats when collapsed */}
                {!isExpanded && (
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      <span>👍 {notice.likeCount || 0}</span>
                      <span>💬 {notice.commentCount || 0}</span>
                    </div>
                    <span className="text-retro-purple dark:text-retro-teal font-vhs">
                      Click to interact
                    </span>
                  </div>
                )}

                {/* Interactive elements - only show when expanded */}
                {isExpanded && (
                  <div
                    className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700"
                    onClick={(e) => e.stopPropagation()} // Prevent card click when interacting
                  >
                    <NoticeInteractionWrapper notice={notice} variant="full" />

                    {/* Collapse button */}
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => toggleNoticeExpansion(notice.id)}
                        className="text-retro-purple dark:text-retro-teal hover:underline font-vhs text-sm"
                      >
                        ▲ Collapse
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Detailed Notice Modal with Full Interactions */}
      {selectedNoticeId && (() => {
        const selectedNotice = notices?.find(n => n.id === selectedNoticeId);
        if (!selectedNotice) return null;

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="neu-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-md font-vhs ${
                        selectedNotice.priority === 'urgent' ? 'bg-red-500 text-white' :
                        selectedNotice.priority === 'high' ? 'bg-orange-500 text-white' :
                        selectedNotice.priority === 'medium' ? 'bg-yellow-500 text-black' :
                        'bg-green-500 text-white'
                      }`}>
                        {(selectedNotice.priority || 'medium').toUpperCase()}
                      </span>
                      <span className="text-xs bg-retro-purple/20 dark:bg-retro-teal/20 text-retro-purple dark:text-retro-teal px-2 py-1 rounded-md font-vhs">
                        {selectedNotice.category || 'general'}
                      </span>
                      <span className="text-xs bg-retro-yellow/20 dark:bg-retro-blue/20 text-retro-orange dark:text-retro-yellow px-2 py-1 rounded-md font-vhs">
                        {selectedNotice.createdAt ? new Date(selectedNotice.createdAt).toLocaleDateString() : 'No date'}
                      </span>
                    </div>
                    <h2 className="text-2xl font-vhs text-retro-purple dark:text-retro-teal mb-2">
                      {selectedNotice.title || 'Untitled Notice'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 font-vhs">
                      {selectedNotice.content || 'No content available'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedNoticeId(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ml-4"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Interactions Section */}
                <NoticeInteractionWrapper notice={selectedNotice} variant="full" />

                <div className="text-xs text-gray-500 dark:text-gray-400 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  Posted on {selectedNotice.createdAt ? new Date(selectedNotice.createdAt).toLocaleDateString() : 'Unknown date'}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>;
};
export default NoticeSection;