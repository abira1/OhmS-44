// Utility functions for sorting data in the OhmS application
import { Student } from '../types';

/**
 * Extracts the numeric part from a roll number string
 * @param rollNumber - Roll number in format like "EEE2301", "CSE2105", etc.
 * @returns The numeric part as a number, or 0 if no numeric part found
 */
export const extractRollNumber = (rollNumber: string): number => {
  // Extract numeric part from roll number (e.g., "EEE2301" -> 2301)
  const numericMatch = rollNumber.match(/\d+/);
  return numericMatch ? parseInt(numericMatch[0], 10) : 0;
};

/**
 * Sorts students by their roll number in ascending numerical order
 * @param students - Array of students to sort
 * @returns New array of students sorted by roll number
 */
export const sortStudentsByRollNumber = (students: Student[]): Student[] => {
  return [...students].sort((a, b) => {
    const rollA = extractRollNumber(a.roll);
    const rollB = extractRollNumber(b.roll);
    
    // Primary sort by numeric part of roll number
    if (rollA !== rollB) {
      return rollA - rollB;
    }
    
    // Secondary sort by full roll string (for cases where numeric parts are same)
    return a.roll.localeCompare(b.roll);
  });
};

/**
 * Sorts and filters students by roll number and search term
 * @param students - Array of students to sort and filter
 * @param searchTerm - Search term to filter by (name or roll number)
 * @returns New array of students sorted by roll number and filtered by search term
 */
export const sortAndFilterStudents = (students: Student[], searchTerm: string = ''): Student[] => {
  // First filter by search term
  const filtered = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.roll.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Then sort by roll number
  return sortStudentsByRollNumber(filtered);
};
