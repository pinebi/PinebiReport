import sql from 'mssql'

const config = {
  server: '185.210.92.248',
  database: 'PinebiWebReport',
  user: 'EDonusum',
  password: '150399AA-DB5B-47D9-BF31-69EB984CB5DF',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
}

// Connection pool removed - using individual connections per query

export async function executeQuery(query: string, params?: any[]) {
  let pool: sql.ConnectionPool | null = null
  try {
    pool = new sql.ConnectionPool(config)
    await pool.connect()
    
    const request = pool.request()
    
    if (params) {
      params.forEach((param, index) => {
        request.input(`param${index}`, param)
      })
    }
    
    const result = await request.query(query)
    return result.recordset
  } catch (err) {
    console.error('SQL Error:', err)
    throw err
  } finally {
    if (pool) {
      await pool.close()
    }
  }
}

// closeConnection function removed - not needed with individual connections

// Report Config operations
export const reportConfig = {
  async findAll() {
    const query = `
      SELECT rc.*, rc.name, rc.description, rc.endpointUrl, rc.apiUsername, rc.apiPassword, rc.headers, 
             rc.categoryId, rc.companyId, rc.userId, rc.isActive, rc.createdAt, rc.updatedAt,
             cat.name as categoryName, comp.name as companyName, u.username as userName
      FROM ReportConfigs rc
      LEFT JOIN ReportCategories cat ON rc.categoryId = cat.id
      LEFT JOIN Companies comp ON rc.companyId = comp.id  
      LEFT JOIN Users u ON rc.userId = u.id
      WHERE rc.isActive = 1
      ORDER BY rc.name ASC
    `
    const results = await executeQuery(query)
    // Add showInMenu field with default value true for compatibility
    return results.map(row => ({ ...row, showInMenu: true }))
  },

  async findByCategory(categoryId: string) {
    const query = `
      SELECT rc.*, rc.name, rc.description, rc.endpointUrl, rc.apiUsername, rc.apiPassword, rc.headers,
             rc.categoryId, rc.companyId, rc.userId, rc.isActive, rc.createdAt, rc.updatedAt,
             cat.name as categoryName, comp.name as companyName, u.username as userName
      FROM ReportConfigs rc
      LEFT JOIN ReportCategories cat ON rc.categoryId = cat.id
      LEFT JOIN Companies comp ON rc.companyId = comp.id
      LEFT JOIN Users u ON rc.userId = u.id
      WHERE rc.isActive = 1 AND rc.categoryId = @param0
      ORDER BY rc.name ASC
    `
    const results = await executeQuery(query, [categoryId])
    // Add showInMenu field with default value true for compatibility
    return results.map(row => ({ ...row, showInMenu: true }))
  },

  async findById(id: string) {
    const query = `
      SELECT rc.*, rc.name, rc.description, rc.endpointUrl, rc.apiUsername, rc.apiPassword, rc.headers,
             rc.categoryId, rc.companyId, rc.userId, rc.isActive, rc.createdAt, rc.updatedAt,
             cat.name as categoryName, comp.name as companyName, u.username as userName
      FROM ReportConfigs rc
      LEFT JOIN ReportCategories cat ON rc.categoryId = cat.id
      LEFT JOIN Companies comp ON rc.companyId = comp.id
      LEFT JOIN Users u ON rc.userId = u.id
      WHERE rc.id = @param0
    `
    const results = await executeQuery(query, [id])
    if (results.length > 0) {
      // Add showInMenu field with default value true for compatibility
      return { ...results[0], showInMenu: true }
    }
    return null
  },

  async create(data: any) {
    const query = `
      INSERT INTO ReportConfigs (id, name, description, endpointUrl, apiUsername, apiPassword, headers,
                                categoryId, companyId, userId, isActive, createdAt, updatedAt)
      VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9, @param10, @param11)
    `
    const params = [
      data.id,
      data.name,
      data.description,
      data.endpointUrl,
      data.apiUsername,
      data.apiPassword,
      data.headers,
      data.categoryId,
      data.companyId,
      data.userId,
      data.isActive,
      new Date(),
      new Date()
    ]
    await executeQuery(query, params)
    return await this.findById(data.id)
  },

  async update(id: string, data: any) {
    const query = `
      UPDATE ReportConfigs 
      SET name = @param1, description = @param2, endpointUrl = @param3, apiUsername = @param4,
          apiPassword = @param5, headers = @param6, categoryId = @param7, companyId = @param8,
          userId = @param9, isActive = @param10, updatedAt = @param11
      WHERE id = @param0
    `
    const params = [
      id,
      data.name,
      data.description,
      data.endpointUrl,
      data.apiUsername,
      data.apiPassword,
      data.headers,
      data.categoryId,
      data.companyId,
      data.userId,
      data.isActive,
      new Date()
    ]
    await executeQuery(query, params)
    return await this.findById(id)
  },

  async delete(id: string) {
    const query = 'UPDATE ReportConfigs SET isActive = 0 WHERE id = @param0'
    await executeQuery(query, [id])
  }
}

// Report Category operations
export const reportCategory = {
  async findAll() {
    const query = `
      SELECT * FROM ReportCategories 
      WHERE isActive = 1 
      ORDER BY sortOrder ASC, name ASC
    `
    return await executeQuery(query)
  },

  async findById(id: string) {
    const query = 'SELECT * FROM ReportCategories WHERE id = @param0'
    const results = await executeQuery(query, [id])
    return results.length > 0 ? results[0] : null
  }
}

// Invoice Flags operations (persist checkbox state per record ID)
export const invoiceFlags = {
  async ensureTable() {
    const query = `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='InvoiceFlags' and xtype='U')
      CREATE TABLE InvoiceFlags (
        recordId NVARCHAR(100) NOT NULL PRIMARY KEY,
        isProcessed BIT NOT NULL DEFAULT(0),
        updatedAt DATETIME NOT NULL DEFAULT(GETDATE())
      )
    `
    await executeQuery(query)
  },

  async findByIds(ids: string[]) {
    if (!ids || ids.length === 0) return []
    await this.ensureTable()
    // Build parameter list
    const params = ids
    const placeholders = ids.map((_, i) => `@param${i}`).join(',')
    const query = `
      SELECT recordId, isProcessed FROM InvoiceFlags WHERE recordId IN (${placeholders})
    `
    const rows = await executeQuery(query, params)
    return rows
  },

  async upsert(recordId: string, isProcessed: boolean) {
    await this.ensureTable()
    const query = `
      MERGE InvoiceFlags AS target
      USING (SELECT @param0 AS recordId, @param1 AS isProcessed) AS source
      ON (target.recordId = source.recordId)
      WHEN MATCHED THEN UPDATE SET isProcessed = source.isProcessed, updatedAt = GETDATE()
      WHEN NOT MATCHED THEN INSERT (recordId, isProcessed, updatedAt) VALUES (source.recordId, source.isProcessed, GETDATE());
    `
    await executeQuery(query, [recordId, isProcessed ? 1 : 0])
    return { recordId, isProcessed }
  }
}