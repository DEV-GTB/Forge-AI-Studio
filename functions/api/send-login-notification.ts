// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, provider } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create email content
    const providerName = provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : 'Email';
    const loginTime = new Date().toLocaleString();
    
    const emailSubject = `Welcome to Forge AI Studio - Login Successful`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Forge AI Studio</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">AI-Powered Development Platform</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Welcome Back!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            You have successfully logged in to <strong>Forge AI Studio</strong> using your <strong>${providerName}</strong> account.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="margin: 0; color: #666;">
              <strong>Login Details:</strong><br>
              Email: ${email}<br>
              Method: ${providerName}<br>
              Time: ${loginTime}
            </p>
          </div>
          
          <h3 style="color: #333;">What is Forge AI Studio?</h3>
          <p style="color: #666; line-height: 1.6;">
            Forge AI Studio is your ultimate AI-powered development platform. Build, code, and create with intelligent agents that assist you every step of the way.
          </p>
          
          <h3 style="color: #333;">Key Features:</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>🤖 <strong>AI Agents:</strong> Intelligent assistants for coding, debugging, and optimization</li>
            <li>💻 <strong>Smart Code Editor:</strong> Syntax highlighting, auto-completion, and real-time suggestions</li>
            <li>🎨 <strong>Project Templates:</strong> Start quickly with pre-built templates for various technologies</li>
            <li>📊 <strong>Real-time Analytics:</strong> Track your usage and optimize your workflow</li>
            <li>🔒 <strong>Secure Authentication:</strong> Multiple login methods including Google, GitHub, and Email</li>
          </ul>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <p style="color: white; margin: 0; font-size: 18px; font-weight: bold;">
              Start Building with AI Today!
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If you didn't log in to Forge AI Studio, please contact our support team immediately.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2026 Forge AI Studio. All rights reserved.<br>
            Built with ❤️ by the GTB Team
          </p>
        </div>
      </div>
    `;

    // Here you would integrate with an email service like:
    // - Resend (https://resend.com)
    // - SendGrid
    // - AWS SES
    // - Cloudflare Email Service
    
    // For now, we'll log the email content (you should integrate with an actual email service)
    console.log('[Login Notification]', {
      to: email,
      subject: emailSubject,
      body: emailBody,
      provider: providerName
    });

    // TODO: Integrate with actual email service
    // Example with Resend:
    // const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    // await resend.emails.send({
    //   from: 'Forge AI Studio <noreply@forgeai-studio.netlify.app>',
    //   to: email,
    //   subject: emailSubject,
    //   html: emailBody
    // });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Login notification logged (email service integration needed)' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[Login Notification Error]', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
