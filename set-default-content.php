<?php
/*********************
 ** Service Catalog **
 *********************/

// Create Service Catalog Node
$sc_node = \Drupal::entityTypeManager()->getStorage("node")->create([
  "type" => "stanford_page",
  "title" => "Service Catalog"
]);
$sc_node->save();

// Create layout for paragraph for Service Catalog.
$sc_paragraph_layout = \Drupal::entityTypeManager()->getStorage("paragraph")->create([
  "type" => "stanford_layout",
  "parent_id" => $sc_node->id(),
  "parent_type" => "node",
  "parent_field_name" => "su_page_components"
]);

$sc_paragraph_layout->setBehaviorSettings("layout_paragraphs", [
  "layout" => "layout_paragraphs_1_column",
  "config" => [
    "label" => ""
  ],
  "parent_uuid" => "",
  "region" => ""
]);
$sc_paragraph_layout->save();

// Create paragraph for Service Catalog
$sc_paragraph = \Drupal::entityTypeManager()->getStorage("paragraph")->create([
  "type" => "stanford_wysiwyg",
  "parent_id" => $sc_node->id(),
  "parent_type" => "node",
  "parent_field_name" => "su_page_components",
  "su_wysiwyg_text" => '{"type":"airtable","view": "service_catalog"}'
]);

$sc_paragraph->setBehaviorSettings("layout_paragraphs", [
  "parent_uuid" => $sc_paragraph_layout->uuid(),
  "region" => "main"
]);
$sc_paragraph->save();

// Add paragraph to service catalog node.
$sc_node->su_page_components = [
  [
    "target_id" => $sc_paragraph_layout->id(),
    "target_revision_id" => $sc_paragraph_layout->getRevisionId()
  ],
  [
    "target_id" => $sc_paragraph->id(),
    "target_revision_id" => $sc_paragraph->getRevisionId()
  ]
];
$sc_node->save();


/****************
 ** Menu Items **
 ****************/
// External Link
\Drupal\menu_link_content\Entity\MenuLinkContent::create(["title" => "Submenu link", "link" => ["uri" => "https://google.com"], "menu_name" => "main", "parent" => "menu_link_field:node_field_menulink_e18a741f-7d86-492a-a02f-7ca73989ca13_und", "expanded" => TRUE, "weight" => 0])->save();

// Service Catalog
\Drupal\menu_link_content\Entity\MenuLinkContent::create(["title" => "Service Catalog", "link" => ["uri" => "internal:/service-catalog"], "menu_name" => "main", "parent" => "menu_link_field:node_field_menulink_e18a741f-7d86-492a-a02f-7ca73989ca13_und", "expanded" => TRUE, "weight" => 0])->save();
