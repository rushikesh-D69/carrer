export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          city: string | null
          state: string | null
          country: string | null
          profile_image: string | null
          education: Json | null
          career_interests: string[] | null
          is_premium: boolean
          premium_expires_at: string | null
          preferred_locale: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'student' | 'mentor' | 'admin' | 'super_admin'
          granted_by: string | null
          granted_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_roles']['Row'], 'id' | 'granted_at'>
        Update: Partial<Database['public']['Tables']['user_roles']['Insert']>
      }
      site_settings: {
        Row: {
          key: string
          value: string | null
          label: string | null
          type: string
          group_name: string
          updated_by: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['site_settings']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['site_settings']['Insert']>
      }
      media: {
        Row: {
          id: string
          title: string
          alt_text: string | null
          url: string
          type: 'image' | 'document' | 'video_thumb' | 'icon' | 'banner'
          file_size: number | null
          width: number | null
          height: number | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['media']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['media']['Insert']>
      }
      career_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          color: string | null
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['career_categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['career_categories']['Insert']>
      }
      careers: {
        Row: {
          id: string
          category_id: string | null
          title: string
          slug: string
          short_description: string | null
          hero_image: string | null
          salary_range: Json | null
          difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          competition_level: 'low' | 'medium' | 'high' | 'very_high'
          duration: string | null
          featured: boolean
          published: boolean
          view_count: number
          seo_title: string | null
          seo_description: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['careers']['Row'], 'id' | 'view_count' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['careers']['Insert']>
      }
      career_sections: {
        Row: {
          id: string
          career_id: string
          section_type: 'overview' | 'eligibility' | 'salary' | 'preparation_timeline' |
            'nature_strategy' | 'study_materials' | 'videos' | 'books' |
            'practice_tests' | 'previous_papers' | 'faq' | 'roadmap' | 'resources' | 'custom'
          title: string | null
          content_md: string | null
          content_json: Json | null
          sort_order: number
          is_visible: boolean
          is_premium: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['career_sections']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['career_sections']['Insert']>
      }
      career_resources: {
        Row: {
          id: string
          career_id: string
          resource_type: 'youtube' | 'pdf' | 'drive' | 'website' | 'book'
          title: string
          url: string
          description: string | null
          thumbnail: string | null
          is_premium: boolean
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['career_resources']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['career_resources']['Insert']>
      }
      question_bank: {
        Row: {
          id: string
          category: 'upsc' | 'ssc' | 'rrb' | 'banking' | 'appsc' |
            'aptitude' | 'reasoning' | 'verbal' | 'general_knowledge' |
            'economics' | 'current_affairs' | 'entrepreneurship'
          topic: string | null
          subtopic: string | null
          difficulty: 'easy' | 'medium' | 'hard'
          question_type: 'mcq' | 'multi_select' | 'true_false'
          question_text: string
          question_image: string | null
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          correct_answer: string
          explanation: string | null
          marks: number
          tags: string[] | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['question_bank']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['question_bank']['Insert']>
      }
      tests: {
        Row: {
          id: string
          title: string
          description: string | null
          instructions: string | null
          duration: number
          total_marks: number
          negative_marking: number
          category: string
          difficulty: 'easy' | 'medium' | 'hard'
          is_premium: boolean
          published: boolean
          random_order: boolean
          passing_percentage: number
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tests']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tests']['Insert']>
      }
      test_attempts: {
        Row: {
          id: string
          user_id: string
          test_id: string
          answers: Json | null
          score: number | null
          percentage: number | null
          time_taken: number | null
          correct_count: number
          wrong_count: number
          skipped_count: number
          is_completed: boolean
          submitted_at: string
        }
        Insert: Omit<Database['public']['Tables']['test_attempts']['Row'], 'id' | 'submitted_at'>
        Update: Partial<Database['public']['Tables']['test_attempts']['Insert']>
      }
      assessments: {
        Row: {
          id: string
          title: string
          description: string | null
          type: 'aptitude' | 'personality' | 'interest' | 'career_fit'
          duration: number | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['assessments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['assessments']['Insert']>
      }
      assessment_questions: {
        Row: {
          id: string
          assessment_id: string
          question: string
          options: Json
          weight: number
          sort_order: number
        }
        Insert: Omit<Database['public']['Tables']['assessment_questions']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['assessment_questions']['Insert']>
      }
      assessment_results: {
        Row: {
          id: string
          user_id: string
          assessment_id: string
          answers: Json | null
          result_json: Json | null
          taken_at: string
        }
        Insert: Omit<Database['public']['Tables']['assessment_results']['Row'], 'id' | 'taken_at'>
        Update: Partial<Database['public']['Tables']['assessment_results']['Insert']>
      }
      blogs: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content_md: string
          featured_image: string | null
          author_id: string | null
          category_id: string | null
          tags: string[] | null
          reading_time: number | null
          published: boolean
          published_at: string | null
          view_count: number
          seo_title: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['blogs']['Row'], 'id' | 'view_count' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['blogs']['Insert']>
      }
      blog_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          sort_order: number
        }
        Insert: Omit<Database['public']['Tables']['blog_categories']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['blog_categories']['Insert']>
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string | null
          priority: 'low' | 'normal' | 'high' | 'urgent'
          publish_date: string | null
          expiry_date: string | null
          is_popup: boolean
          is_banner: boolean
          is_active: boolean
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>
      }
      events: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          event_type: 'webinar' | 'seminar' | 'workshop' | 'exam' | 'other'
          start_date: string
          end_date: string | null
          location: string | null
          meeting_url: string | null
          registration_link: string | null
          is_free: boolean
          price: number | null
          max_participants: number | null
          featured_image: string | null
          published: boolean
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      user_library: {
        Row: {
          id: string
          user_id: string
          item_type: 'career' | 'blog' | 'resource' | 'test' | 'event'
          item_id: string
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_library']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_library']['Insert']>
      }
      leads: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          message: string | null
          source: 'home_page' | 'career_page' | 'contact_form' | 'assessment' | 'blog' | 'event' | 'announcement' | 'other'
          status: 'new' | 'contacted' | 'qualified' | 'enrolled' | 'closed' | 'spam'
          career_interest: string | null
          metadata: Json | null
          assigned_to: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          name: string | null
          is_active: boolean
          source: string | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['newsletter_subscribers']['Row'], 'id' | 'subscribed_at'>
        Update: Partial<Database['public']['Tables']['newsletter_subscribers']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string | null
          type: string
          action_url: string | null
          read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          test_id: string
          attempt_id: string
          certificate_number: string | null
          certificate_url: string | null
          issued_at: string
        }
        Insert: Omit<Database['public']['Tables']['certificates']['Row'], 'id' | 'issued_at'>
        Update: Partial<Database['public']['Tables']['certificates']['Insert']>
      }
    }
    Views: {}
    Functions: {
      is_admin: { Args: { uid: string }; Returns: boolean }
      is_premium_user: { Args: { uid: string }; Returns: boolean }
    }
    Enums: {
      user_role: 'student' | 'mentor' | 'admin' | 'super_admin'
      difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
      competition_level: 'low' | 'medium' | 'high' | 'very_high'
      resource_type: 'youtube' | 'pdf' | 'drive' | 'website' | 'book'
      section_type: 'overview' | 'eligibility' | 'salary' | 'preparation_timeline' |
        'nature_strategy' | 'study_materials' | 'videos' | 'books' |
        'practice_tests' | 'previous_papers' | 'faq' | 'roadmap' | 'resources' | 'custom'
      question_category: 'upsc' | 'ssc' | 'rrb' | 'banking' | 'appsc' |
        'aptitude' | 'reasoning' | 'verbal' | 'general_knowledge' |
        'economics' | 'current_affairs' | 'entrepreneurship'
      announcement_priority: 'low' | 'normal' | 'high' | 'urgent'
      library_item_type: 'career' | 'blog' | 'resource' | 'test' | 'event'
      event_type: 'webinar' | 'seminar' | 'workshop' | 'exam' | 'other'
      lead_source: 'home_page' | 'career_page' | 'contact_form' | 'assessment' | 'blog' | 'event' | 'announcement' | 'other'
      lead_status: 'new' | 'contacted' | 'qualified' | 'enrolled' | 'closed' | 'spam'
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type UserRole = Database['public']['Tables']['user_roles']['Row']
export type SiteSetting = Database['public']['Tables']['site_settings']['Row']
export type CareerCategory = Database['public']['Tables']['career_categories']['Row']
export type Career = Database['public']['Tables']['careers']['Row']
export type CareerSection = Database['public']['Tables']['career_sections']['Row']
export type CareerResource = Database['public']['Tables']['career_resources']['Row']
export type QuestionBank = Database['public']['Tables']['question_bank']['Row']
export type Test = Database['public']['Tables']['tests']['Row']
export type TestAttempt = Database['public']['Tables']['test_attempts']['Row']
export type Assessment = Database['public']['Tables']['assessments']['Row']
export type AssessmentQuestion = Database['public']['Tables']['assessment_questions']['Row']
export type AssessmentResult = Database['public']['Tables']['assessment_results']['Row']
export type Blog = Database['public']['Tables']['blogs']['Row']
export type BlogCategory = Database['public']['Tables']['blog_categories']['Row']
export type Announcement = Database['public']['Tables']['announcements']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type UserLibrary = Database['public']['Tables']['user_library']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type Certificate = Database['public']['Tables']['certificates']['Row']

// Extended types with joins
export type CareerWithCategory = Career & {
  career_categories: CareerCategory | null
}

export type CareerWithSections = Career & {
  career_categories: CareerCategory | null
  career_sections: CareerSection[]
  career_resources: CareerResource[]
}

export type BlogWithAuthor = Blog & {
  blog_categories: BlogCategory | null
  author: { full_name: string | null; profile_image: string | null } | null
}

export type TestWithQuestions = Test & {
  test_questions: Array<{
    question_bank: QuestionBank
    sort_order: number
  }>
}
