import { streamText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { getUser } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    // Check authentication
    const user = await getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'You must be logged in to use AI features' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured')
      return new Response(
        JSON.stringify({ error: 'AI service is not configured. Please contact support.' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Get job details from request body
    const jobDetails = await req.json()
    console.log('Received job details for AI generation:', jobDetails)

    // Build the prompt
    const prompt = `You are an expert HR professional creating job descriptions for the Gambian market.

Generate a compelling job description for:

Job Title: ${jobDetails.title}
Company: ${jobDetails.companyName || 'Our company'}
Location: ${jobDetails.location || 'The Gambia'} (${jobDetails.workLocation})
Experience Level: ${jobDetails.experienceLevel || 'Not specified'}
Job Type: ${jobDetails.jobType}
Number of Openings: ${jobDetails.numberOfOpenings || 1}
Industries: ${jobDetails.industries?.join(', ') || jobDetails.companyIndustry || 'Not specified'}
Key Skills: ${jobDetails.skills?.join(', ') || 'To be determined'}
Language: ${jobDetails.jobLanguage || 'English'}
${jobDetails.benefits?.length ? `Benefits: ${jobDetails.benefits.join(', ')}` : ''}
${jobDetails.supplementalPay?.length ? `Supplemental Pay: ${jobDetails.supplementalPay.join(', ')}` : ''}
${jobDetails.educationRequirements ? `Education Requirements: ${jobDetails.educationRequirements}` : ''}
${jobDetails.experienceRequirements ? `Experience Requirements: ${jobDetails.experienceRequirements}` : ''}

Create a job description with:
1. An engaging overview of the role
2. 5-8 key responsibilities specific to ${jobDetails.title}
3. What the company offers (benefits, growth)
4. Why someone should join
5. Tailored for the ${jobDetails.location || 'Gambian'} market

IMPORTANT: Format your response as HTML with:
- <h3> for section headings
- <p> for paragraphs with NO extra line breaks between them
- <ul> and <li> for bullet points
- Do NOT use markdown formatting
- Do NOT add empty lines or <br> tags between paragraphs
- Keep formatting compact with single spacing
- Each paragraph should immediately follow the previous element`

    // Initialize Google AI provider with API key
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY
    })

    // Create the streaming response
    const result = await streamText({
      model: google('gemini-2.5-flash'),
      prompt,
      temperature: 0.7,
      maxTokens: 1500,
    })

    // Return the streaming response
    return result.toDataStreamResponse()

  } catch (error) {
    console.error('Error in job-description route:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate description. Please try again.',
        details: errorMessage 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}