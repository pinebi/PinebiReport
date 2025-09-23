import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "sqlserver://185.210.92.248:1433;database=PinebiWebReport;user=EDonusum;password=150399AA-DB5B-47D9-BF31-69EB984CB5DF;trustServerCertificate=true;encrypt=true"
    }
  },
  log: ['error'],
  errorFormat: 'minimal'
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database connection test
export async function testDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Initialize database with seed data
export async function initializeDatabase() {
  try {
    // Check if admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { username: 'admin' }
    })

    if (!adminUser) {
      // Create default company
      const defaultCompany = await prisma.company.create({
        data: {
          name: 'Varsayılan Şirket',
          code: 'DEFAULT',
          address: 'Türkiye',
          phone: '+90 212 555 0000',
          email: 'info@company.com',
          taxNumber: '1234567890'
        }
      })

      // Create admin user
      await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@company.com',
          firstName: 'Yönetici',
          lastName: 'Admin',
          password: 'admin', // In production, this should be hashed
          companyId: defaultCompany.id,
          role: 'ADMIN'
        }
      })

      // Create reporter user
      await prisma.user.create({
        data: {
          username: 'reporter',
          email: 'reporter@company.com',
          firstName: 'Rapor',
          lastName: 'Kullanıcısı',
          password: 'reporter', // In production, this should be hashed
          companyId: defaultCompany.id,
          role: 'REPORTER'
        }
      })

      // Create default categories
      const salesCategory = await prisma.reportCategory.create({
        data: {
          name: 'Satış Raporları',
          description: 'Satış performansı ve analiz raporları',
          icon: '📊',
          color: '#3B82F6',
          sortOrder: 1
        }
      })

      const financeCategory = await prisma.reportCategory.create({
        data: {
          name: 'Finansal Raporlar',
          description: 'Muhasebe ve finansal analiz raporları',
          icon: '💰',
          color: '#8B5CF6',
          sortOrder: 2
        }
      })

      // Create subcategories
      await prisma.reportCategory.create({
        data: {
          name: 'Aylık Satış',
          description: 'Aylık satış performans raporları',
          parentId: salesCategory.id,
          icon: '📈',
          color: '#10B981',
          sortOrder: 1
        }
      })

      await prisma.reportCategory.create({
        data: {
          name: 'Günlük Satış',
          description: 'Günlük satış detay raporları',
          parentId: salesCategory.id,
          icon: '📅',
          color: '#F59E0B',
          sortOrder: 2
        }
      })

      console.log('✅ Database initialized with seed data')
    }

    return true
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    return false
  }
}

// Utility functions for database operations
export const db = {
  // Company operations
  company: {
    findAll: () => prisma.company.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    }),
    
    findById: (id: string) => prisma.company.findUnique({
      where: { id },
      include: { users: true, reports: true }
    }),
    
    create: (data: any) => prisma.company.create({ data }),
    
    update: (id: string, data: any) => prisma.company.update({
      where: { id },
      data
    }),
    
    delete: (id: string) => prisma.company.update({
      where: { id },
      data: { isActive: false }
    })
  },

  // User operations
  user: {
    findAll: () => prisma.user.findMany({
      where: { isActive: true },
      include: { company: true },
      orderBy: { firstName: 'asc' }
    }),
    
    findByUsername: (username: string) => prisma.user.findFirst({
      where: { 
        username: username,
        isActive: true 
      },
      include: { company: true }
    }),
    
    findById: (id: string) => prisma.user.findUnique({
      where: { id },
      include: { company: true }
    }),
    
    findByUsername: (username: string) => prisma.user.findUnique({
      where: { username },
      include: { company: true }
    }),
    
    create: (data: any) => prisma.user.create({
      data,
      include: { company: true }
    }),
    
    update: (id: string, data: any) => prisma.user.update({
      where: { id },
      data,
      include: { company: true }
    }),
    
    delete: (id: string) => prisma.user.update({
      where: { id },
      data: { isActive: false }
    })
  },

  // Report Category operations
  reportCategory: {
    findAll: () => prisma.reportCategory.findMany({
      where: { isActive: true },
      include: { parent: true, children: true },
      orderBy: { sortOrder: 'asc' }
    }),
    
    findById: (id: string) => prisma.reportCategory.findUnique({
      where: { id },
      include: { parent: true, children: true, reports: true }
    }),
    
    create: (data: any) => prisma.reportCategory.create({
      data,
      include: { parent: true, children: true }
    }),
    
    update: (id: string, data: any) => prisma.reportCategory.update({
      where: { id },
      data,
      include: { parent: true, children: true }
    }),
    
    delete: (id: string) => prisma.reportCategory.update({
      where: { id },
      data: { isActive: false }
    })
  },

      // Report Config operations
      reportConfig: {
        findAll: () => prisma.reportConfig.findMany({
          where: { isActive: true },
          include: { category: true, company: true, user: true },
          orderBy: { name: 'asc' }
        }),
        
        findByCategory: (categoryId: string) => prisma.reportConfig.findMany({
          where: { 
            isActive: true,
            categoryId: categoryId
          },
          include: { category: true, company: true, user: true },
          orderBy: { name: 'asc' }
        }),
    
    findById: (id: string) => prisma.reportConfig.findUnique({
      where: { id },
      include: { category: true, company: true, user: true, executions: true }
    }),
    
    create: (data: any) => prisma.reportConfig.create({
      data,
      include: { category: true, company: true, user: true }
    }),
    
    update: (id: string, data: any) => prisma.reportConfig.update({
      where: { id },
      data,
      include: { category: true, company: true, user: true }
    }),
    
    delete: (id: string) => prisma.reportConfig.update({
      where: { id },
      data: { isActive: false }
    })
  },

  // Report Execution operations
  reportExecution: {
    findAll: () => prisma.reportExecution.findMany({
      include: { report: true, user: true },
      orderBy: { startTime: 'desc' }
    }),
    
    findById: (id: string) => prisma.reportExecution.findUnique({
      where: { id },
      include: { report: true, user: true }
    }),
    
    create: (data: any) => prisma.reportExecution.create({
      data,
      include: { report: true, user: true }
    }),
    
    update: (id: string, data: any) => prisma.reportExecution.update({
      where: { id },
      data,
      include: { report: true, user: true }
    })
  },

  // API Config operations
  apiConfig: {
    findAll: () => prisma.apiConfig.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    }),
    
    findById: (id: string) => prisma.apiConfig.findUnique({
      where: { id }
    }),
    
    create: (data: any) => prisma.apiConfig.create({ data }),
    
    update: (id: string, data: any) => prisma.apiConfig.update({
      where: { id },
      data
    }),
    
    delete: (id: string) => prisma.apiConfig.update({
      where: { id },
      data: { isActive: false }
    })
  },

  // User Grid Settings operations
  userGridSettings: {
    findByUserAndGrid: (userId: string, gridType: string) => prisma.userGridSettings.findUnique({
      where: {
        userId_gridType: {
          userId,
          gridType
        }
      }
    }),
    
    upsert: (userId: string, gridType: string, settings: any) => prisma.userGridSettings.upsert({
      where: {
        userId_gridType: {
          userId,
          gridType
        }
      },
      update: {
        ...settings,
        updatedAt: new Date()
      },
      create: {
        userId,
        gridType,
        ...settings
      }
    }),
    
    delete: (userId: string, gridType: string) => prisma.userGridSettings.delete({
      where: {
        userId_gridType: {
          userId,
          gridType
        }
      }
    })
  }
}

