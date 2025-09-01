#!/usr/bin/env node

/**
 * Scrypto Verification System
 * Programmatic tests to verify file existence, API endpoints, and page functionality
 */

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

class ScryptoVerifier {
  constructor() {
    this.basePath = path.join(__dirname, '../../')
    this.results = []
    this.timestamp = new Date().toISOString()
  }

  log(domain, group, item, check, status, details = '') {
    this.results.push({
      domain,
      group, 
      item,
      check,
      status, // 'pass', 'fail', 'partial', 'n/a'
      details,
      timestamp: this.timestamp
    })
    
    const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : status === 'partial' ? '⚠️' : '➖'
    console.log(`${emoji} ${domain}/${group}/${item} - ${check}: ${status.toUpperCase()}`)
    if (details) console.log(`   Details: ${details}`)
  }

  fileExists(filePath) {
    const fullPath = path.join(this.basePath, filePath)
    return fs.existsSync(fullPath)
  }

  async checkFileStructure() {
    console.log('\n🔍 CHECKING FILE STRUCTURE...\n')

    // Patient routes
    const patientRoutes = [
      'app/patient/page.tsx',
      'app/patient/persinfo/profile/page.tsx',
      'app/patient/medhist/allergies/page.tsx',
      'app/patient/medhist/conditions/page.tsx',
      'app/patient/medhist/immunizations/page.tsx',
      'app/patient/medhist/surgeries/page.tsx',
      'app/patient/medhist/family-history/page.tsx',
      'app/patient/persinfo/emergency-contacts/page.tsx',
      'app/patient/persinfo/dependents/page.tsx',
      'app/patient/carenet/caregivers/page.tsx',
      'app/patient/vitality/vital-signs/page.tsx'
    ]

    for (const route of patientRoutes) {
      const [, domain, group, item] = route.split('/')
      const exists = this.fileExists(route)
      this.log(domain, group || '-', item || 'homepage', 'page_exists', exists ? 'pass' : 'fail', route)
    }

    // API routes
    const apiRoutes = [
      'app/api/patient/medical-history/allergies/route.ts',
      'app/api/patient/medical-history/allergies/[id]/route.ts',
      'app/api/patient/medical-history/conditions/route.ts',
      'app/api/patient/medical-history/conditions/[id]/route.ts',
      'app/api/patient/medical-history/immunizations/route.ts',
      'app/api/patient/medical-history/immunizations/[id]/route.ts',
      'app/api/patient/medical-history/surgeries/route.ts',
      'app/api/patient/medical-history/surgeries/[id]/route.ts',
      'app/api/patient/medical-history/family-history/route.ts',
      'app/api/patient/medical-history/family-history/[id]/route.ts'
    ]

    for (const route of apiRoutes) {
      const exists = this.fileExists(route)
      const parts = route.split('/')
      const domain = parts[2]
      const group = parts[3] + '-' + parts[4]
      const item = parts[5]
      this.log(domain, group, item, 'api_exists', exists ? 'pass' : 'fail', route)
    }

    // Schemas
    const schemas = [
      'schemas/allergies.ts',
      'schemas/conditions.ts', 
      'schemas/immunizations.ts',
      'schemas/surgeries.ts',
      'schemas/familyHistory.ts',
      'schemas/emergencyContacts.ts',
      'schemas/dependents.ts',
      'schemas/caregivers.ts'
    ]

    for (const schema of schemas) {
      const exists = this.fileExists(schema)
      const item = path.basename(schema, '.ts')
      this.log('patient', 'schemas', item, 'schema_exists', exists ? 'pass' : 'fail', schema)
    }

    // Hooks
    const hooks = [
      'hooks/usePatientAllergies.ts',
      'hooks/usePatientConditions.ts',
      'hooks/usePatientImmunizations.ts', 
      'hooks/usePatientSurgeries.ts',
      'hooks/usePatientFamilyHistory.ts',
      'hooks/usePatientEmergencyContacts.ts',
      'hooks/usePatientDependents.ts',
      'hooks/usePatientCaregivers.ts'
    ]

    for (const hook of hooks) {
      const exists = this.fileExists(hook)
      const item = path.basename(hook, '.ts').replace('usePatient', '').toLowerCase()
      this.log('patient', 'hooks', item, 'hook_exists', exists ? 'pass' : 'fail', hook)
    }

    // Pharmacy files
    const pharmacyFiles = [
      'app/pharmacy/page.tsx',
      'app/pharmacy/prescriptions/[workflowId]/page.tsx',
      'components/features/pharmacy/PharmacyValidationWorkstation.tsx',
      'components/layouts/PharmacySidebar.tsx',
      'config/pharmacyNav.ts'
    ]

    for (const file of pharmacyFiles) {
      const exists = this.fileExists(file)
      const parts = file.split('/')
      const domain = 'pharmacy'
      const group = parts[2] || 'core'
      const item = path.basename(file, path.extname(file))
      this.log(domain, group, item, 'file_exists', exists ? 'pass' : 'fail', file)
    }
  }

  async checkApiEndpoints() {
    console.log('\n🌐 CHECKING API ENDPOINTS...\n')
    
    const endpoints = [
      { path: '/api/patient/medical-history/allergies', method: 'GET', domain: 'patient', group: 'medhist', item: 'allergies' },
      { path: '/api/patient/medical-history/conditions', method: 'GET', domain: 'patient', group: 'medhist', item: 'conditions' },
      { path: '/api/patient/medical-history/immunizations', method: 'GET', domain: 'patient', group: 'medhist', item: 'immunizations' },
      { path: '/api/patient/medical-history/surgeries', method: 'GET', domain: 'patient', group: 'medhist', item: 'surgeries' },
      { path: '/api/patient/medical-history/family-history', method: 'GET', domain: 'patient', group: 'medhist', item: 'family-history' },
      { path: '/api/patient/personal-info/emergency-contacts', method: 'GET', domain: 'patient', group: 'persinfo', item: 'emergency-contacts' },
      { path: '/api/patient/personal-info/dependents', method: 'GET', domain: 'patient', group: 'persinfo', item: 'dependents' },
      { path: '/api/patient/care-network/caregivers', method: 'GET', domain: 'patient', group: 'carenet', item: 'caregivers' }
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:4569${endpoint.path}`, {
          method: endpoint.method,
          headers: { 'Accept': 'application/json' }
        })
        
        const status = response.status === 401 ? 'pass' : // Expected unauthorized
                      response.status === 200 ? 'pass' : 
                      response.status === 404 ? 'fail' : 'partial'
        
        this.log(endpoint.domain, endpoint.group, endpoint.item, 'api_responds', status, 
                 `${endpoint.method} ${endpoint.path} → ${response.status}`)
      } catch (error) {
        this.log(endpoint.domain, endpoint.group, endpoint.item, 'api_responds', 'fail', 
                 `${endpoint.method} ${endpoint.path} → ${error.message}`)
      }
    }
  }

  async checkPages() {
    console.log('\n📱 CHECKING PAGE RESPONSES...\n')
    
    const pages = [
      { path: '/patient', domain: 'patient', group: 'core', item: 'homepage' },
      { path: '/patient/medhist/allergies', domain: 'patient', group: 'medhist', item: 'allergies' },
      { path: '/patient/medhist/conditions', domain: 'patient', group: 'medhist', item: 'conditions' },
      { path: '/patient/persinfo/emergency-contacts', domain: 'patient', group: 'persinfo', item: 'emergency-contacts' },
      { path: '/patient/persinfo/dependents', domain: 'patient', group: 'persinfo', item: 'dependents' },
      { path: '/patient/carenet/caregivers', domain: 'patient', group: 'carenet', item: 'caregivers' },
      { path: '/pharmacy', domain: 'pharmacy', group: 'core', item: 'homepage' },
      { path: '/pharmacy/prescriptions/wf-2025-001', domain: 'pharmacy', group: 'prescriptions', item: 'validation' }
    ]

    for (const page of pages) {
      try {
        const response = await fetch(`http://localhost:4569${page.path}`, {
          headers: { 'Accept': 'text/html' }
        })
        
        const status = response.status === 200 ? 'pass' :
                      response.status === 302 ? 'pass' : // Redirect to login
                      response.status === 401 ? 'pass' : // Auth required
                      'fail'
        
        this.log(page.domain, page.group, page.item, 'page_responds', status,
                 `${page.path} → ${response.status}`)
      } catch (error) {
        this.log(page.domain, page.group, page.item, 'page_responds', 'fail',
                 `${page.path} → ${error.message}`)
      }
    }
  }

  async checkDatabaseConnectivity() {
    console.log('\n🗄️ CHECKING DATABASE...\n')
    
    try {
      // Check if we can reach the health endpoint (if it exists)
      const response = await fetch('http://localhost:4569/api/health', {
        headers: { 'Accept': 'application/json' }
      })
      
      this.log('infrastructure', 'database', 'connectivity', 'health_check', 
               response.status === 200 ? 'pass' : 'partial', 
               `Health endpoint → ${response.status}`)
    } catch (error) {
      this.log('infrastructure', 'database', 'connectivity', 'health_check', 'fail', error.message)
    }
  }

  async checkTypeScriptCompilation() {
    console.log('\n📝 CHECKING TYPESCRIPT...\n')
    
    try {
      const { stdout, stderr } = await execAsync('npm run typecheck', { cwd: this.basePath })
      this.log('infrastructure', 'typescript', 'compilation', 'typecheck', 'pass', 'TypeScript compiles cleanly')
    } catch (error) {
      this.log('infrastructure', 'typescript', 'compilation', 'typecheck', 'fail', 
               `TypeScript errors: ${error.stderr || error.message}`)
    }
  }

  generateReport() {
    console.log('\n📊 GENERATING REPORT...\n')

    // Calculate statistics
    const total = this.results.length
    const passed = this.results.filter(r => r.status === 'pass').length
    const failed = this.results.filter(r => r.status === 'fail').length
    const partial = this.results.filter(r => r.status === 'partial').length

    // Generate standardized report format
    const report = `# Scrypto Implementation Verification Report
## Automated Status Check
Date: ${new Date().toISOString().split('T')[0]}
Version: 1.0

## STATS
|stat-name="Total Checks";stat-type="count";stat-source="all"|
|stat-name="Passing Rate";stat-type="percentage";stat-source="col-4";stat-condition="pass"|
|stat-name="Status Distribution";stat-type="pie";stat-source="col-4";stat-condition="pass,fail,partial,n/a"|
|stat-name="File Coverage";stat-type="percentage";stat-source="col-4";stat-condition="pass"|

## SUMMARY
Automated verification of **${total} checks** across Scrypto implementation. 

**Results:**
- ✅ **${passed} passing** (${Math.round(passed/total*100)}%)
- ❌ **${failed} failing** (${Math.round(failed/total*100)}%)
- ⚠️ **${partial} partial** (${Math.round(partial/total*100)}%)

**Key Findings:**
- File structure verification completed
- API endpoint responsiveness tested
- Page routing functionality verified
- TypeScript compilation status checked

## DATA
| Domain | Group | Item | Check | Status | Details |
${this.results.map(r => 
  `| ${r.domain} | ${r.group} | ${r.item} | ${r.check} | ${r.status}@${r.status === 'pass' ? 'green' : r.status === 'fail' ? 'red' : r.status === 'partial' ? 'orange' : 'gray'} | ${r.details} |`
).join('\n')}
`

    // Save report
    const reportPath = path.join(__dirname, '../reports', `verification-${new Date().toISOString().split('T')[0]}.md`)
    fs.mkdirSync(path.dirname(reportPath), { recursive: true })
    fs.writeFileSync(reportPath, report)
    
    console.log(`\n📋 Report saved: ${reportPath}`)
    console.log(`\n📊 Summary: ${passed}/${total} checks passing (${Math.round(passed/total*100)}%)`)
    
    return report
  }

  async runFullVerification() {
    console.log('🚀 Starting Scrypto Verification...\n')
    
    await this.checkFileStructure()
    await this.checkApiEndpoints()
    await this.checkPages()
    await this.checkDatabaseConnectivity()
    await this.checkTypeScriptCompilation()
    
    return this.generateReport()
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new ScryptoVerifier()
  verifier.runFullVerification()
    .then(() => {
      console.log('\n✅ Verification complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Verification failed:', error.message)
      process.exit(1)
    })
}

module.exports = ScryptoVerifier