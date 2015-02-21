require 'docker'
require_relative 'base_image'

class DevServer
    attr_accessor :docker, :base_image, :dev_container_name, :app_path

    def initialize
        @docker = Docker.new ports: [3000, 8090, 5858]
        @base_image = BaseImage.new
        @dev_container_name = 'codequest_dev'
        @app_path = File.expand_path("#{File.dirname(__FILE__)}/../src")
    end

    def start
        base_image.build_if_missing
        create_dev_image
        create_run_container
    end

    def create_run_container
        puts 'Dev environment ready! Starting tty container...'
        args = "--rm -ti -P -p 3000:3000 -p 8090:8090 -p 5858:5858 -v #{app_path}:/src codequest_dev"
        docker.run('codequest_dev', args, remove_if_exists: true)
        puts 'Stopping tty container...'
    end

    def create_dev_image
        unless docker.image_exists? 'codequest_dev'
            puts "codequest_dev image hasn't been built yet. Building..."
            docker.build("-t codequest_dev #{app_path}")
        end
    end
end







