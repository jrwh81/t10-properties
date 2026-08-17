class AdminInvitationSerializer
  def initialize(invitation)
    @invitation = invitation
  end

  def as_json(*)
    {
      id: invitation.id,
      email: invitation.email,
      invited_by: invitation.invited_by.display_name,
      accepted: invitation.accepted?,
      expired: invitation.expired?,
      expires_at: invitation.expires_at,
      created_at: invitation.created_at,
      accept_url: accept_url
    }
  end

  private

  attr_reader :invitation

  def accept_url
    "#{ENV.fetch('FRONTEND_ORIGIN', 'http://localhost:5173')}/admin/accept-invite/#{invitation.token}"
  end
end
