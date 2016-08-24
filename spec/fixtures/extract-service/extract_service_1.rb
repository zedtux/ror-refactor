class User
  after_create :finalize_user_creation

  def finalize_user_creation
    tweet_new_user_joined_the_app
    accept_invitation_and_welcome_user
  end

  def tweet_new_user_joined_the_app
    # Twitter code here
  end

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
