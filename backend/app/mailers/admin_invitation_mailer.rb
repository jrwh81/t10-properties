class AdminInvitationMailer < ApplicationMailer
  def invite(admin_invitation)
    @admin_invitation = admin_invitation
    @accept_url = "#{ENV.fetch('FRONTEND_ORIGIN', 'http://localhost:5173')}/admin/accept-invite/#{admin_invitation.token}"

    mail(to: admin_invitation.email, subject: "You're invited to manage T10 Properties")
  end
end
