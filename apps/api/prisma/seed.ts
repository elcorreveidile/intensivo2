import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Professor (Javier)
  const professor = await prisma.user.upsert({
    where: { email: 'profesor@test.com' },
    update: {},
    create: {
      email: 'profesor@test.com',
      passwordHash,
      role: UserRole.profesor,
      firstName: 'Javier',
      lastName: 'Benítez Láinez',
      nativeLanguage: 'Spanish',
      proficiencyLevel: 'NATIVE',
      isActive: true,
    },
  });
  console.log('✅ Created professor:', professor.email);

  // 2. Create Students (7 US students)
  const studentsData = [
    { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@test.com' },
    { firstName: 'Michael', lastName: 'Chen', email: 'michael.c@test.com' },
    { firstName: 'Emma', lastName: 'Davis', email: 'emma.d@test.com' },
    { firstName: 'John', lastName: 'Smith', email: 'john.s@test.com' },
    { firstName: 'Anna', lastName: 'Liu', email: 'anna.l@test.com' },
    { firstName: 'David', lastName: 'Park', email: 'david.p@test.com' },
    { firstName: 'Lisa', lastName: 'Martínez', email: 'lisa.m@test.com' },
  ];

  const students = [];
  for (const studentData of studentsData) {
    const student = await prisma.user.upsert({
      where: { email: studentData.email },
      update: {},
      create: {
        email: studentData.email,
        passwordHash,
        role: UserRole.estudiante,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        nativeLanguage: 'English',
        proficiencyLevel: 'C1',
        isActive: true,
      },
    });
    students.push(student);
    console.log('✅ Created student:', student.email);
  }

  // 3. Create Course
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30); // 30 days course

  const course = await prisma.course.upsert({
    where: { code: 'CLMABROAD-2025' },
    update: {},
    create: {
      name: 'Curso de Especial Diseño CLMABROAD',
      code: 'CLMABROAD-2025',
      description: 'Curso intensivo de español para estudiantes estadounidenses de nivel avanzado (C1)',
      professorId: professor.id,
      startDate,
      endDate,
      maxStudents: 30,
      isActive: true,
    },
  });
  console.log('✅ Created course:', course.code);

  // 4. Enroll all students in the course
  for (const student of students) {
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: course.id,
        },
      },
      update: {},
      create: {
        userId: student.id,
        courseId: course.id,
      },
    });
  }
  console.log(`✅ Enrolled ${students.length} students in the course`);

  // 5. Create sample assignments
  const assignmentsData = [
    {
      title: 'Tarea 1: Presentación Personal',
      description: 'Graba un video de 2-3 minutos presentándote y explicando tu interés por aprender español.',
      instructions: 'Habla sobre tu origen, tus hobbies y por qué decidiste estudiar en Granada.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      maxScore: 100,
      rubric: {
        criteria: [
          { name: 'Pronunciación', max: 30 },
          { name: 'Fluidez', max: 30 },
          { name: 'Gramática', max: 25 },
          { name: 'Vocabulario', max: 15 },
        ],
      },
    },
    {
      title: 'Tarea 2: Crónica de Granada',
      description: 'Escribe una crónica narrativa sobre tu experiencia en Granada.',
      instructions: 'Enfócate en un aspecto cultural específico (gastronomía, monumentos, gente, etc.). Longitud: 500-700 palabras.',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      maxScore: 100,
      rubric: {
        criteria: [
          { name: 'Gramática', max: 30 },
          { name: 'Vocabulario', max: 25 },
          { name: 'Cohesión', max: 20 },
          { name: 'Creatividad', max: 15 },
          { name: 'Ortografía', max: 10 },
        ],
      },
    },
    {
      title: 'Tarea 3: Entrevista Cultural',
      description: 'Realiza una entrevista en español a un local de Granada.',
      instructions: 'Prepara al menos 10 preguntas y graba la entrevista (5-7 min). Incluye transcripción parcial y reflexión.',
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      maxScore: 100,
      rubric: {
        criteria: [
          { name: 'Preguntas', max: 25 },
          { name: 'Interacción', max: 30 },
          { name: 'Comprensión', max: 25 },
          { name: 'Transcripción', max: 20 },
        ],
      },
    },
  ];

  for (const [index, assignmentData] of assignmentsData.entries()) {
    await prisma.assignment.create({
      data: {
        courseId: course.id,
        ...assignmentData,
        allowedFileTypes: ['pdf', 'docx', 'mp3', 'mp4'],
        maxFileSizeMb: 100,
        allowLateSubmission: false,
        orderIndex: index,
      },
    });
    console.log(`✅ Created assignment: ${assignmentData.title}`);
  }

  // 6. Create sample resources
  const resourcesData = [
    {
      title: 'Guía de Pronunciación',
      description: 'PDF con guía completa de pronunciación del español',
      sessionNumber: 1,
      resourceType: 'document',
      fileUrl: '/resources/guia_pronunciacion.pdf',
      fileName: 'guia_pronunciacion.pdf',
    },
    {
      title: 'Virtual Tour: La Alhambra',
      description: 'Video tour por el monumento más emblemático de Granada',
      sessionNumber: 1,
      resourceType: 'video',
      fileUrl: '/resources/alhambra_tour.mp4',
      fileName: 'alhambra_tour.mp4',
    },
    {
      title: 'Vocabulario de Gastronomía',
      description: 'Lista de vocabulario útil para describir comida',
      sessionNumber: 2,
      resourceType: 'document',
      fileUrl: '/resources/vocab_gastronomia.pdf',
      fileName: 'vocab_gastronomia.pdf',
    },
  ];

  for (const [index, resourceData] of resourcesData.entries()) {
    await prisma.resource.create({
      data: {
        courseId: course.id,
        ...resourceData,
        orderIndex: index,
      },
    });
    console.log(`✅ Created resource: ${resourceData.title}`);
  }

  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('📧 Login credentials:');
  console.log('   Professor: profesor@test.com / password123');
  console.log('   Students: sarah.j@test.com / password123');
  console.log('             (same password for all students)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
