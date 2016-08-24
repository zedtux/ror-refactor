class 
  include Interactor

  def call
    accept_invitation_and_welcome_user
  end

  private

  def accept_invitation_and_welcome_user
    accept_user_invitation
    send_welcome_email
    clear_user_invitation_token
  end

  def accept_user_invitation
    self.accept_invitation = true
    self.invitation_accepted_at = Time.zone.now
  end

  def send_welcome_email
    UserMailer.welcome_user(self).deliver_later
  end

  def clear_user_invitation_token
    self.invitation_token = nil
    save
  end
end
