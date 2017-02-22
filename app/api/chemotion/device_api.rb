module Chemotion
  class DeviceAPI < Grape::API
    resource :devices do
      desc "Create Device"
      params do
        optional :title, type: String, desc: "device name"
        optional :code, type: String, desc: "device code hash"
        optional :types, type: Array, desc: "device types"
        optional :samples, type: Array, desc: "device samples"
      end
      post do
        attributes = declared(params, include_missing: false)
        device = Device.new(attributes.except!(:samples))
        params[:samples].map {|sample|
          DevicesSample.create({sample_id: sample.id, device_id: device.id})
        }
        device.save!
        current_user.devices << device
        device
      end

      desc "get Device by Id"
      params do
        requires :id, type: Integer, desc: "Device id"
      end
        get '/:id' do
          device = Device.find_by(id: params[:id])
          if device.nil?
            error!("404 Device with supplied id not found", 404)
          else
            device
          end
      end

      desc "set selected_device of user"
      route_param :id do
        post 'selected' do 
          device = Device.find_by(id: params[:id])
          if device.nil?
            error!("404 Device with supplied id not found", 404)
          else
            user = User.find_by(id: device.user_id)
            unless user.nil?
              user.selected_device = device
              user.save!
              device.id
            end
          end
        end
      end

      desc "Delete a device by id"
      params do
        requires :id, type: Integer, desc: "device id"
      end
      route_param :id do
        delete do
          device = Device.find(params[:id])
          if device.nil?
            error!("404 Device with supplied id not found", 404)
          else
            device.devices_samples.destroy_all
            device.destroy
          end
        end
      end

      desc "Update Device by id"
      params do
        requires :id, type: Integer, desc: "device id"
        optional :title, type: String, desc: "device name"
        optional :code, type: String, desc: "device code hash"
        optional :types, type: Array, desc: "device types"
        optional :samples, type: Array, desc: "device samples"
      end
      route_param :id do
        put do
          attributes = declared(params, include_missing: false)
          device = Device.find(params[:id])
          if device.nil?
            error!("404 Device with supplied id not found", 404)
          else
            # update devices_samples
            old_sample_ids = device.devices_samples.map {|devices_sample| devices_sample.sample_id}
            new_sample_ids = params[:samples].map {|sample|
              DevicesSample.create({sample_id: sample.id, device_id: device.id})
              sample.id
            }
            to_remove_sample_ids = old_sample_ids - new_sample_ids
            to_remove_sample_ids.map{|sample_id| 
              device.devices_samples.find_by(sample_id: sample_id).destroy
            }
            device.update(attributes.except!(:samples))
            # FIXME how to prevent this?
            Device.find(params[:id])
          end
        end
      end

      desc "get Devices"
      get do
        Device.all
      end

      desc "get nmr Analyses"
      params do
        requires :id, type: Integer, desc: "device id"
        requires :sample_id, type: Integer, desc: "sample id"
      end
      get '/:id/samples/:sample_id/nmr' do
        analysis = DevicesAnalysis.find_by(
          device_id: params[:id],
          sample_id: params[:sample_id],
          analysis_type: 'NMR'
        )
        if analysis.nil?
          error!("404 NMR-Analysis of Device not found", 404)
        else
          analysis
        end
      end
    end
  end
end
