const { Course } = require('../models'); // Assuming you have a Course model in your Sequelize models

// server/controllers/courseController.js

// Get all courses
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.findAll(); // Fetch all courses from the database
        return res.status(200).json(courses);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get a single course by ID
const getCourseById = async (req, res) => {
    const { id } = req.params;
    try {
        const course = await Course.findByPk(id); // Find the course by ID
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        return res.status(200).json(course);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Create a new course
const createCourse = async (req, res) => {
    const { title, description, instructor } = req.body;
    
    try {
        // Create a new course
        const course = await Course.create({
            title,
            description,
            instructor
        });

        return res.status(201).json(course);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Update an existing course
const updateCourse = async (req, res) => {
    const { id } = req.params;
    const { title, description, instructor } = req.body;
    
    try {
        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Update course information
        course.title = title || course.title;
        course.description = description || course.description;
        course.instructor = instructor || course.instructor;

        await course.save();

        return res.status(200).json(course);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Delete a course
const deleteCourse = async (req, res) => {
    const { id } = req.params;
    
    try {
        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        await course.destroy(); // Delete the course from the database
        return res.status(200).json({ message: 'Course deleted' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
};
