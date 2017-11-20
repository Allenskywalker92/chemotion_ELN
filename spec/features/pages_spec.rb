require 'rails_helper'

feature 'Pages' do
  let!(:john) { create(:person) }

  background do
    john.confirmed_at = Time.now
    john.save
    sign_in(john)
  end

  describe 'Change Profile' do
    scenario 'sets "Show external name" from false to true, and vice versa', js: true do
      [true, false].each do |bool_flag|
        visit '/pages/profiles'
        expect(john.reload.profile.show_external_name).to eq !bool_flag

        page.find(:css, 'input[type="checkbox"]').set(bool_flag)
        click_button 'Change my profile'
        sleep 1
        expect(john.reload.profile.show_external_name).to eq(bool_flag)
      end
    end
  end
end
