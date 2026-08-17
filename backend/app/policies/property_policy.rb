class PropertyPolicy < ApplicationPolicy
  def index? = true
  def show? = true
  def create? = admin?
  def update? = admin?
  def destroy? = admin?

  class Scope < Scope
    def resolve
      admin? ? scope.all : scope.where(status: %w[active pending sold])
    end

    private

    def admin?
      user&.admin?
    end
  end
end
