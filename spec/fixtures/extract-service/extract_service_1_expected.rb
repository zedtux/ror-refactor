class User
  after_create :finalize_user_creation

  def finalize_user_creation
    tweet_new_user_joined_the_app
    accept_invitation_and_welcome_user
  end

  def tweet_new_user_joined_the_app
    # Twitter code here
  end
end
