import { useEffect, useState } from 'react';
import Checkbox from './Checkbox';
import { UpdateVideo } from '../../API/VideoCaller';
import PropTypes from 'prop-types';

const VideoUpdater = ({ videoData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [subject, setSubject] = useState('');
  const [isMain, setIsMain] = useState(false);

  // Populate form when videoData is received or updated
  useEffect(() => {
    if (videoData) {
      setTitle(videoData.title || '');
      setDescription(videoData.description || '');
      setTeacherName(videoData.teacher_name || '');
      setSubject(videoData.subject || '');
      setIsMain(videoData.is_main || false);
    }
  }, [videoData]);

  const handleUpdate = async () => {
    const updatedData = {
      title,
      description,
      teacher_name: teacherName,
      subject,
      is_main: isMain,
      is_published: videoData.is_published,
    };

    try {
      const res = await UpdateVideo({
        video_id: videoData.video_id,
        updatedData,
      });

      console.log('Video updated successfully:', res);
      alert('Video updated successfully!');
    } catch (error) {
      console.error('Error while updating the video:', error);
      alert('An error occurred while updating the video.');
    }
  };

  return (
    <div className="flex flex-col p-2 space-x-2 space-y-4">
      <h1 className="text-2xl font-bold mb-4 text-[--white]">
        Update video information
      </h1>

      <input
        type="text"
        value={title}
        readOnly
        placeholder="The video ID"
        className="text-lg text-[--white] bg-neutral-500 rounded-lg px-2"
      />

      <input
        type="text"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Update the description"
        className="text-lg text-[--white] bg-neutral-500 rounded-lg px-2"
      />

      <input
        type="text"
        value={teacherName}
        onChange={e => setTeacherName(e.target.value)}
        placeholder="Update the teacher name"
        className="text-lg text-[--white] bg-neutral-500 rounded-lg px-2"
        id="teacher_name"
      />

      <input
        type="text"
        value={subject}
        onChange={e => setSubject(e.target.value)}
        placeholder="Update the subject"
        className="text-lg text-[--white] bg-neutral-500 rounded-lg px-2"
      />

      <Checkbox setIsMain={setIsMain} isMain={isMain} />

      <button
        onClick={handleUpdate}
        className="bg-neutral-500 rounded-lg text-xl text-[--white] px-4 py-2 hover:bg-neutral-600 transition-all"
      >
        Update
      </button>
    </div>
  );
};

VideoUpdater.propTypes = {
  videoData: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    teacher_name: PropTypes.string,
    subject: PropTypes.string,
    is_main: PropTypes.bool,
    is_published: PropTypes.bool,
    video_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  }).isRequired,
};

export default VideoUpdater;
