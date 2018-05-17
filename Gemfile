source 'https://rubygems.org'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.2.10'

gem 'thor', '0.19.1'

gem 'haml-rails', '~> 0.9'
# Use SCSS for stylesheets
gem 'sass-rails', '~> 5.0', '>= 5.0.6'

# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# Twitter bootstrap styles
gem 'bootstrap-sass', '~> 3.3.5'
# Use jquery as the JavaScript library
gem 'jquery-rails'
# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
# gem 'turbolinks'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.0'
# bundle exec rake doc:rails generates the API under doc/api.
gem 'sdoc', '~> 0.4.0', group: :doc

group :development do
  gem 'rack-mini-profiler', git: 'https://github.com/MiniProfiler/rack-mini-profiler'

  # For memory profiling (requires Ruby MRI 2.1+)
  gem 'memory_profiler'

  # For call-stack profiling flamegraphs (requires Ruby MRI 2.0.0+)
  gem 'fast_stack'    # For Ruby MRI 2.0
  gem 'flamegraph'
  gem 'stackprof'     # For Ruby MRI 2.1+
  gem 'web-console', '~> 2.0'
end

gem 'pg', '~> 0.20.0'
gem 'pg_search'

gem 'devise'
gem 'jwt'

gem 'dotenv-rails', require: 'dotenv/rails-now'

gem 'browserify-rails', '~> 4.2.0'

# for collection tree structure
gem 'ancestry'
gem 'closure_tree'

gem 'net-sftp'
gem 'net-ssh'

# svg composer
gem 'nokogiri', '~> 1.8.2'

# SFTP client
gem 'fun_sftp', git: 'https://github.com/fl9/fun_sftp.git',
                branch: 'allow-port-option'

# API
gem 'grape', '<1.0.0'
gem 'grape-active_model_serializers'
gem 'grape-kaminari'
gem 'hashie-forbidden_attributes'
gem 'kaminari'

gem 'pundit'

# Report Generator
gem 'axlsx', git: 'https://github.com/randym/axlsx'
gem 'rmagick'
gem 'rtf'
gem 'sablon', git: 'https://github.com/ComPlat/sablon'
# Import of elements from XLS and CSV file
gem 'roo', '>2.5.0'

gem 'faraday', '~> 0.12.1'
gem 'faraday_middleware', '~> 0.12.1'
gem 'httparty'

gem 'ketcherails', git: 'https://git.scc.kit.edu/ComPlat/ketcher-rails.git', branch: 'coordination_bond_suppport'
# git: 'https://github.com/ComPlat/ketcher-rails',
#                   ref: '19b5bd5344462295a2633ccfefed8a5bb4f85f28'

# Free font icons
gem 'font-awesome-rails'

# delayed job
gem 'delayed_job_active_record'
gem 'delayed_cron_job'

# required by cap3 delayed-job but has to be specified manually
gem 'daemons'

# dataset previews
gem 'thumbnailer', git: 'https://github.com/merlin-p/thumbnailer.git'

# data integrity
gem 'paranoia', '~> 2.0'

gem 'backup'
gem 'whenever', require: false
gem 'rubocop', require: false
gem 'yaml_db'

gem 'ruby-ole'
gem 'ruby-geometry', require: 'geometry'

# CI
gem 'coveralls', require: false

# openbabel
# to compile from github/openbabel/openbabel master
# gem 'openbabel', '2.4.1.2', git: 'https://github.com/ComPlat/openbabel-gem'
# to compile from github/openbabel/openbabel branch openbabel-2-4-x
gem 'openbabel', '2.4.90.1', git: 'https://github.com/ComPlat/openbabel-gem'

gem 'barby'
gem 'prawn'
gem 'prawn-svg'
gem 'rqrcode'

gem 'countries'
gem 'gman'
gem 'ruby-mailchecker'
gem 'swot'

group :development, :test do
  # Rails better error page
  gem 'better_errors' # allows to debug exception on backend from browser
  gem 'binding_of_caller'

  gem 'mailcatcher'

  # Call 'byebug' anywhere in the code to stop execution
  # and get a debugger console
  gem 'byebug'

  # Access an IRB console on exception pages or by using <%= console %> in views

  gem 'bullet'

  # Spring speeds up development by keeping your application
  # running in the background. Read more: https://github.com/rails/spring
  gem 'spring'

  # Testing
  gem 'rspec-rails'

  # Use thin as dev webserver
  gem 'thin'

  # generate icon fonts
  gem 'fontcustom'

  # nice debug print
  gem 'awesome_print'

  # RailsPanel Chrome extension
  gem 'meta_request'

  # Remove all assets requests
  gem 'quiet_assets'

  gem 'capistrano', '3.9.1'
  gem 'capistrano-bundler'
  gem 'capistrano-npm'
  gem 'capistrano-nvm', require: false
  gem 'capistrano-rails'
  gem 'capistrano-rvm'
  # gem 'capistrano3-delayed-job'
  gem 'slackistrano'
  gem 'rubyXL', '3.3.26'
end

group :test do
  gem 'database_cleaner'
  gem 'factory_girl_rails'

  gem 'capybara', '~> 3.1.0'
  gem 'chromedriver-helper', '1.2.0'
  gem 'faker', '~> 1.6.6'
  gem 'headless', '2.0.0'
  gem 'launchy', '~> 2.4.3'
  gem 'selenium-webdriver', '~> 3.7.0'
  gem 'webmock'
end

# Chemotion plugins: list your ELN specific plugin gems in the Gemfile.plugin
eln_plugin = File.join(File.dirname(__FILE__), "Gemfile.plugin")
if File.exists?(eln_plugin)
  eval_gemfile eln_plugin
end

####
