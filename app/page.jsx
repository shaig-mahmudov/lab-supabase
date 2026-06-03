'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase, supabaseConfigError } from '../lib/supabaseClient'
import styles from './page.module.css'

const emptyStudentForm = {
  name: '',
  email: '',
  course: '',
  picture_url: '',
  grade: '',
}

export default function Home() {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [newStudent, setNewStudent] = useState(emptyStudentForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  const fetchStudents = useCallback(async () => {
    await Promise.resolve()

    if (!supabase) {
      setStudents([])
      setError(supabaseConfigError)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    let query = supabase
      .from('students')
      .select('*')
      .order('name', { ascending: true })

    if (courseFilter) {
      query = query.eq('course', courseFilter)
    }

    const { data, error } = await query

    if (error) {
      setStudents([])
      setError(error.message)
    } else {
      setStudents(data ?? [])
    }

    setLoading(false)
  }, [courseFilter])

  const fetchCourses = useCallback(async () => {
    await Promise.resolve()

    if (!supabase) {
      setCourses([])
      return
    }

    const { data, error } = await supabase
      .from('students')
      .select('course')
      .order('course', { ascending: true })

    if (!error) {
      const courseNames = data
        .map((student) => student.course)
        .filter(Boolean)

      setCourses([...new Set(courseNames)])
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchStudents()
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [fetchStudents])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCourses()
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [fetchCourses])

  const visibleStudents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return students
    }

    return students.filter((student) =>
      student.name.toLowerCase().includes(normalizedSearch)
    )
  }, [students, searchTerm])

  function updateNewStudent(field, value) {
    setNewStudent((currentStudent) => ({
      ...currentStudent,
      [field]: value,
    }))
  }

  async function handleAddStudent(event) {
    event.preventDefault()
    setFormError(null)

    if (!supabase) {
      setFormError(supabaseConfigError)
      return
    }

    const studentToInsert = {
      name: newStudent.name.trim(),
      email: newStudent.email.trim(),
      course: newStudent.course.trim(),
      picture_url: newStudent.picture_url.trim(),
      grade: newStudent.grade.trim() || null,
    }

    if (
      !studentToInsert.name ||
      !studentToInsert.email ||
      !studentToInsert.course ||
      !studentToInsert.picture_url
    ) {
      setFormError('Name, email, course, and picture URL are required.')
      return
    }

    setSaving(true)

    const { error } = await supabase.from('students').insert(studentToInsert)

    if (error) {
      setFormError(error.message)
    } else {
      setNewStudent(emptyStudentForm)
      setCourses((currentCourses) =>
        currentCourses.includes(studentToInsert.course)
          ? currentCourses
          : [...currentCourses, studentToInsert.course].sort()
      )
      await fetchStudents()
    }

    setSaving(false)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Student List</h1>
        <p>Data coming live from your Supabase backend</p>
      </header>

      <main className={styles.main}>
        <section className={styles.controls} aria-label="Student filters">
          <label className={styles.field}>
            <span>Search by name</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Ada Lovelace"
            />
          </label>

          <label className={styles.field}>
            <span>Course</span>
            <select
              value={courseFilter}
              onChange={(event) => setCourseFilter(event.target.value)}
            >
              <option value="">All courses</option>
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </label>
        </section>

        <form className={styles.form} onSubmit={handleAddStudent}>
          <h2>Add Student</h2>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Name</span>
              <input
                value={newStudent.name}
                onChange={(event) => updateNewStudent('name', event.target.value)}
                placeholder="Grace Hopper"
                required
              />
            </label>
            <label className={styles.field}>
              <span>Email</span>
              <input
                type="email"
                value={newStudent.email}
                onChange={(event) => updateNewStudent('email', event.target.value)}
                placeholder="grace@example.com"
                required
              />
            </label>
            <label className={styles.field}>
              <span>Course</span>
              <input
                value={newStudent.course}
                onChange={(event) => updateNewStudent('course', event.target.value)}
                placeholder="Web Development"
                required
              />
            </label>
            <label className={styles.field}>
              <span>Grade</span>
              <input
                value={newStudent.grade}
                onChange={(event) => updateNewStudent('grade', event.target.value)}
                placeholder="A"
              />
            </label>
            <label className={`${styles.field} ${styles.wideField}`}>
              <span>Picture URL</span>
              <input
                type="url"
                value={newStudent.picture_url}
                onChange={(event) =>
                  updateNewStudent('picture_url', event.target.value)
                }
                placeholder="https://example.com/student.jpg"
                required
              />
            </label>
          </div>

          <div className={styles.formActions}>
            <button type="submit" disabled={saving || !supabase}>
              {saving ? 'Adding...' : 'Add student'}
            </button>
            {formError && <p className={styles.formError}>{formError}</p>}
          </div>
        </form>

        {loading && (
          <p className={styles.message}>Loading students...</p>
        )}

        {error && (
          <div className={styles.errorBox}>
            <p className={styles.errorTitle}>Could not connect to Supabase</p>
            <p className={styles.errorHint}>
              Make sure you created your <code>.env.local</code> file with your project URL and anon key.
            </p>
            <code className={styles.errorDetail}>{error}</code>
          </div>
        )}

        {!loading && !error && students.length === 0 && (
          <p className={styles.message}>
            No students found. Did you run the SQL and add some rows in your Supabase dashboard?
          </p>
        )}

        {!loading && !error && students.length > 0 && visibleStudents.length === 0 && (
          <p className={styles.message}>
            No students match your current search.
          </p>
        )}

        {!loading && !error && visibleStudents.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map((student) => (
                <tr key={student.id}>
                  <td className={styles.avatarCell}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className={styles.avatar}
                      src={student.picture_url}
                      alt={student.name}
                    />
                  </td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.course}</td>
                  <td>{student.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  )
}
