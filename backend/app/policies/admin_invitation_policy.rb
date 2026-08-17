class AdminInvitationPolicy < ApplicationPolicy
  def index? = admin?
  def create? = admin?
  def destroy? = admin?
end
