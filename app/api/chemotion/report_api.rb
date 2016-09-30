module Chemotion
  class ReportAPI < Grape::API
    resource :reports do
      desc "Build a report using the contents of a JSON file"

      params do
        requires :id
      end
      get :docx do
        reaction = Reaction.find(params[:id])
        content = Report::Docx::Document.new(reactions: [reaction]).reactions

        filename = "ELN_Reaction_" + Time.now.strftime("%Y-%m-%dT%H-%M-%S") + ".docx"
        template_path = Rails.root.join("lib", "template", "ELN_Reactions.docx")

        content_type MIME::Types.type_for(filename)[0].to_s
        env['api.format'] = :binary
        header 'Content-Disposition', "attachment; filename*=UTF-8''#{CGI.escape(filename)}"
        docx = Sablon.template(template_path).render_to_string(merge(content, all_settings, all_configs))
      end

      params do
        requires :type, type: String
        requires :checkedIds
        requires :uncheckedIds
        requires :checkedAll, type: Boolean
        requires :currentCollection, type: Integer
      end
      get :export_samples_from_selections do
        env['api.format'] = :binary
        content_type('application/vnd.ms-excel')
        header 'Content-Disposition', "attachment; filename*=UTF-8''#{URI.escape("#{params[:type].capitalize}_#{Time.now.strftime("%Y-%m-%dT%H-%M-%S")}.xlsx")}"
        excel = Report::ExcelExport.new
        # - - - - - - -
        type = params[:type]
        checkedIds = params[:checkedIds].split(",")
        uncheckedIds = params[:uncheckedIds].split(",")
        checkedAll = params[:checkedAll]
        currentCollection = params[:currentCollection]

        elements = selected_elements(type, checkedAll, checkedIds, uncheckedIds, currentCollection)
        samples = if type == "sample"
          elements.includes(:molecule)
        elsif type == "reaction"
          elements.map { |r| r.starting_materials + r.reactants + r.products }.flatten
        elsif type == "wellplate"
          elements.map do |wellplate|
            wellplate.wells.map { |well| well.sample }.flatten
          end.flatten
        end

        samples.each { |sample| excel.add_sample(sample) }
        excel.generate_file(excluded_field, included_field)
      end

      params do
        requires :id, type: String
      end
      get :excel_wellplate do
        env['api.format'] = :binary
        content_type('application/vnd.ms-excel')
        header 'Content-Disposition', "attachment; filename*=UTF-8''#{URI.escape("Wellplate #{params[:id]} Samples Excel.xlsx")}"

        excel = Report::ExcelExport.new

        Wellplate.find(params[:id]).wells.each do |well|
          sample = well.sample
          if (sample)
            excel.add_sample(sample)
          end
        end

        excel.generate_file(excluded_field, included_field)
      end

      params do
        requires :id, type: String
      end
      get :excel_reaction do
        env['api.format'] = :binary
        content_type('application/vnd.ms-excel')
        header 'Content-Disposition', "attachment; filename*=UTF-8''#{URI.escape("Reaction #{params[:id]} Samples Excel.xlsx")}"

        excel = Report::ExcelExport.new

        reaction = Reaction.find(params[:id])

        reaction.starting_materials.each do |material|
          excel.add_sample(material)
        end
        reaction.reactants.each do |reactant|
          excel.add_sample(reactant)
        end
        reaction.products.each do |product|
          excel.add_sample(product)
        end

        excel.generate_file(excluded_field, included_field)
      end
    end

    resource :multiple_reports do
      desc "Build a multi-reactions report using the contents of a JSON file"

      params do
        requires :ids
        requires :settings
        requires :configs
      end

      get :docx do
        ids = params[:ids].split("_")
        settings = set_settings(params[:settings].split("_"))
        configs = set_configs(params[:configs].split("_"))
        reactions = ids.map { |id| Reaction.find(id) }
        contents = Report::Docx::Document.new(reactions: reactions).reactions

        filename = "ELN_Reactions_" + Time.now.strftime("%Y-%m-%dT%H-%M-%S") + ".docx"
        template_path = Rails.root.join("lib", "template", "ELN_Reactions.docx")

        content_type MIME::Types.type_for(filename)[0].to_s
        env['api.format'] = :binary
        header 'Content-Disposition', "attachment; filename*=UTF-8''#{CGI.escape(filename)}"
        docx = Sablon.template(template_path).render_to_string(merge(contents, settings, configs))
      end
    end

    helpers do
      def set_settings(settings)
        {
          formula: settings.index("formula"),
          material: settings.index("material"),
          description: settings.index("description"),
          purification: settings.index("purification"),
          tlc: settings.index("tlc"),
          observation: settings.index("observation"),
          analysis: settings.index("analysis"),
          literature: settings.index("literature"),
        }
      end

      def all_settings
        {
          formula: true,
          material: true,
          description: true,
          purification: true,
          tlc: true,
          observation: true,
          analysis: true,
          literature: true,
        }
      end

      def set_configs(configs)
        {
          pageBreak: configs.index("pagebreak"),
          wholeFormula: configs.index("showallmater"),
          productFormula: !configs.index("showallmater")
        }
      end

      def all_configs
        {
          pageBreak: true,
          wholeFormula: true,
          productFormula: false
        }
      end

      def merge(contents, settings, configs)
        {
          date: Time.now.strftime("%d.%m.%Y"),
          author: "#{current_user.first_name} #{current_user.last_name}",
          settings: settings,
          configs: configs,
          reactions: contents
        }
      end

      def excluded_field
        [
          "id", "molecule_id", "analyses_dump", "created_by", "deleted_at",
          "user_id", "fingerprint_id"
        ]
      end

      def included_field
        ["molecule.cano_smiles", "molecule.sum_formular"]
      end

      def selected_elements(type, checkedAll, checkedIds, uncheckedIds, currentCollection)
        elements = "#{type}s".to_sym
        if checkedAll
          Collection.find(currentCollection).send(elements).where.not(id: uncheckedIds)
        else
          Collection.find(currentCollection).send(elements).where(id: checkedIds)
        end
      end
    end
  end
end
