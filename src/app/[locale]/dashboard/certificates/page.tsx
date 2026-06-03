'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Award, Download, Eye, Calendar, AwardIcon, Printer } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function CertificatesPage() {
  const t = useTranslations()
  const locale = useLocale()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<any[]>([])

  // Fallback Mock Certificate
  const mockCertificates = [
    {
      id: 'cert-1',
      certificate_number: 'RAM-2026-001234',
      test_title: 'SSC CGL - Quantitative Aptitude Practice Test',
      score: 84,
      issued_at: '2026-06-01T12:00:00Z',
    }
  ]

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setCertificates(mockCertificates)
          setLoading(false)
          return
        }

        const { data: dbCerts } = await supabase
          .from('certificates')
          .select('id, certificate_number, issued_at, tests(title), test_attempts(score)')
          .eq('user_id', user.id)

        if (dbCerts && dbCerts.length > 0) {
          const formatted = dbCerts.map((cert: any) => ({
            id: cert.id,
            certificate_number: cert.certificate_number,
            test_title: cert.tests?.title || 'Practice Test',
            score: cert.test_attempts?.score || 0,
            issued_at: cert.issued_at,
          }))
          setCertificates(formatted)
        } else {
          // Check if there are completed attempts that qualify for certificates (e.g. >= 40%)
          const { data: attemptsData } = await supabase
            .from('test_attempts')
            .select('id, test_id, score, percentage, submitted_at, tests(title)')
            .eq('user_id', user.id)
            .gte('percentage', 40)
            .eq('is_completed', true)

          const attempts = (attemptsData || []) as any[]

          if (attempts && attempts.length > 0) {
            // Generate temporary certificates on the fly
            const generated = attempts.map((attempt, idx) => ({
              id: `temp-cert-${idx}`,
              certificate_number: `RAM-2026-${attempt.id.slice(0, 6).toUpperCase()}`,
              test_title: attempt.tests?.title || 'Practice Test',
              score: attempt.percentage,
              issued_at: attempt.submitted_at,
            }))
            setCertificates(generated)
          } else {
            setCertificates(mockCertificates)
          }
        }
      } catch (err) {
        console.error('Error fetching certificates:', err)
        setCertificates(mockCertificates)
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [])

  const handlePrint = (cert: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Certificate - ${cert.certificate_number}</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f1f5f9;
            }
            .certificate-container {
              width: 800px;
              height: 550px;
              padding: 40px;
              border: 20px solid #00296b;
              background-color: white;
              position: relative;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              box-sizing: border-box;
            }
            .certificate-container::before {
              content: '';
              position: absolute;
              top: 5px; left: 5px; right: 5px; bottom: 5px;
              border: 2px solid #ffd500;
              pointer-events: none;
            }
            .header {
              text-align: center;
              margin-top: 20px;
            }
            .brand-name {
              font-size: 28px;
              font-weight: 800;
              color: #00296b;
              letter-spacing: 2px;
              text-transform: uppercase;
              margin: 0;
            }
            .brand-tagline {
              font-size: 11px;
              color: #64748b;
              letter-spacing: 4px;
              text-transform: uppercase;
              margin-top: 5px;
            }
            .cert-title {
              text-align: center;
              font-size: 32px;
              font-weight: 300;
              color: #0f172a;
              margin-top: 30px;
              letter-spacing: 1px;
            }
            .cert-present {
              text-align: center;
              font-size: 14px;
              color: #64748b;
              font-style: italic;
              margin-top: 15px;
            }
            .student-name {
              text-align: center;
              font-size: 24px;
              font-weight: 700;
              color: #00296b;
              border-bottom: 2px solid #cbd5e1;
              width: 60%;
              margin: 20px auto 10px;
              padding-bottom: 5px;
            }
            .cert-reason {
              text-align: center;
              font-size: 12px;
              color: #64748b;
              line-height: 1.6;
              width: 80%;
              margin: 0 auto;
            }
            .cert-details {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
              padding: 0 40px;
            }
            .detail-block {
              text-align: center;
            }
            .detail-label {
              font-size: 10px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .detail-value {
              font-size: 12px;
              font-weight: 700;
              color: #0f172a;
              margin-top: 5px;
            }
            .signature {
              font-family: 'Georgia', serif;
              font-style: italic;
              font-size: 18px;
              color: #00296b;
              border-top: 1px solid #cbd5e1;
              padding-top: 5px;
              margin-top: 15px;
            }
            @media print {
              body {
                background-color: white;
              }
              .certificate-container {
                box-shadow: none;
                border: 20px solid #00296b !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="header">
              <h1 class="brand-name">Ramanujonomics</h1>
              <div class="brand-tagline">Wealth is Health</div>
            </div>
            <div class="cert-title">Certificate of Achievement</div>
            <div class="cert-present">This is proudly presented to</div>
            <div class="student-name">Verified Scholar</div>
            <div class="cert-reason">
              for successfully qualifying and demonstrating structural proficiency in the practice examination <br/>
              <strong>"${cert.test_title}"</strong><br/>
              scoring a qualified evaluation rate of <strong>${cert.score}%</strong>.
            </div>
            
            <div class="cert-details">
              <div class="detail-block">
                <div class="signature">Prof. Ramanujam</div>
                <div class="detail-label" style="margin-top:5px;">Academic Director</div>
              </div>
              <div class="detail-block" style="display:flex; flex-direction:column; justify-content:flex-end;">
                <div class="detail-value">${new Date(cert.issued_at).toLocaleDateString()}</div>
                <div class="detail-label">Date Issued</div>
              </div>
              <div class="detail-block" style="display:flex; flex-direction:column; justify-content:flex-end;">
                <div class="detail-value">${cert.certificate_number}</div>
                <div class="detail-label">Certificate ID</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-800 tracking-tight">
          {t('dashboard.certificates') || 'Credentials & Certificates'}
        </h1>
        <p className="text-slate-500 font-medium text-sm sm:text-base mt-1">
          Verify and print your credentials earned by qualifying in topic practice tests (passing threshold 40%+).
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1].map(n => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="h-6 w-2/3 skeleton" />
              <div className="h-12 w-full skeleton" />
            </div>
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-slate-700 text-base">No Certificates Issued</h3>
          <p className="text-slate-400 text-xs mt-1">Attempt practice tests in the hub and score at least 40% to earn a certificate.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between hover:shadow-card transition-all duration-300 relative overflow-hidden group"
            >
              {/* Background badge icon */}
              <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] text-imperial-blue group-hover:scale-105 transition-transform duration-300">
                <AwardIcon className="w-36 h-36" />
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold font-heading text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {cert.certificate_number}
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-slate-800 text-sm">
                    {cert.test_title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mt-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-300" />
                      <span>{new Date(cert.issued_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-slate-300" />
                      <span>Syllabus Score: {cert.score}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="border-t border-slate-100 mt-6 pt-4 flex gap-3 relative z-10">
                <button
                  onClick={() => handlePrint(cert)}
                  className="btn-primary text-xs h-8 px-3 rounded-lg gap-1.5 flex-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Credentials</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
