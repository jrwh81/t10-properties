module Api
  module V1
    class AdminInvitationsController < BaseController
      before_action :require_admin!, except: [:accept]

      # GET /api/v1/admin_invitations
      def index
        return if performed?

        render json: { admin_invitations: AdminInvitation.pending.map { |i| AdminInvitationSerializer.new(i).as_json } }
      end

      # POST /api/v1/admin_invitations
      def create
        return if performed?

        invitation = AdminInvitation.new(email: params[:email], invited_by: current_user)
        invitation.save!

        AdminInvitationMailer.invite(invitation).deliver_later

        render json: { admin_invitation: AdminInvitationSerializer.new(invitation).as_json }, status: :created
      end

      # DELETE /api/v1/admin_invitations/:id
      def destroy
        return if performed?

        AdminInvitation.find(params[:id]).destroy
        head :no_content
      end

      # POST /api/v1/admin_invitations/:token/accept
      # Public endpoint: the emailed link brings an unauthenticated
      # visitor here to create their admin account.
      def accept
        invitation = AdminInvitation.find_by(token: params[:token])

        if invitation.nil? || invitation.accepted? || invitation.expired?
          return render json: { error: "This invitation is invalid or has expired." }, status: :unprocessable_entity
        end

        user = User.new(
          name: params[:name],
          email: invitation.email,
          password: params[:password],
          password_confirmation: params[:password_confirmation],
          role: "admin"
        )

        if user.save
          invitation.accept!
          sign_in(user)
          render json: { user: UserSerializer.new(user).as_json }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end
    end
  end
end
