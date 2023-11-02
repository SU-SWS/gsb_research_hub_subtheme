<?php
  function gsb_research_hub_subtheme_form_system_theme_settings_alter(&$form, \Drupal\Core\Form\FormStateInterface $form_state, $form_id = NULL) {
      // Work-around for a core bug affecting admin themes. See issue #943212.
      if (isset($form_id)) {
        return;
      }

      $sl_env = theme_get_setting('gsb_research_hub_subtheme_sl_env', 'gsb_research_hub_subtheme');
  
      $form['gsb_research_hub_subtheme_sl_env'] = array(
        '#type'          => 'select',
        '#title'         => t('SnapLogic Environment'),
        '#options'       => [
          'dev' => t('Dev'),
          'test' => t('Test'),
          'prod' => t('Prod'),
        ],
        '#default_value' => is_null($sl_env) ? 'prod' : $sl_env,
        '#description'   => t("Sets the environment to use for the site."),
      );
  }