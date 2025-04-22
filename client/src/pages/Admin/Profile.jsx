import React, { useState, useEffect } from 'react';

const Profile = ({ originalStudent }) => {
  // ... (keep the same state and logic as previous version)

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 text-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <label 
          htmlFor="avatar-upload"
          className="cursor-pointer inline-block relative hover:ring-2 hover:ring-blue-500 rounded-full transition-all"
        >
          <img 
            src={avatarPreview || '/default-avatar.jpg'} 
            alt="Avatar Preview" 
            className="w-32 h-32 rounded-full object-cover border-2 border-slate-700"
          />
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="text-sm font-medium">Change Photo</span>
          </div>
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <input
            type="text"
            name="name"
            value={student.name || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <input
            type="email"
            name="email"
            value={student.email || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Major</label>
          <input
            type="text"
            name="major"
            value={student.major || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!Object.keys(changes).length}
            className="px-6 py-2 text-sm font-medium text-white bg-transparent hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!Object.keys(changes).length}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;