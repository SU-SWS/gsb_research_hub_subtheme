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
  "parent_uuid" => $paragraph_layout->uuid(),
  "region" => "main"
]);
$sc_paragraph->save();

// Add paragraph to service catalog node.
$node->su_page_components = [
  [
    "target_id" => $paragraph_layout->id(),
    "target_revision_id" => $paragraph_layout->getRevisionId()
  ],
  [
    "target_id" => $paragraph->id(),
    "target_revision_id" => $paragraph->getRevisionId()
  ]
];
$node->save();


/****************
 ** Menu Items **
 ****************/

// Service Catalog
\Drupal\menu_link_content\Entity\MenuLinkContent::create(["title" => "Service Catalog", "link" => ["uri" => "internal:/service-catalog"], "menu_name" => "main", "parent" => "menu_link_field:node_field_menulink_e18a741f-7d86-492a-a02f-7ca73989ca13_und", "expanded" => TRUE, "weight" => 0])->save();

