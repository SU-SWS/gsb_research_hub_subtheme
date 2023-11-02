<?php
/*******************
 ** Enable Person **
 *******************/
\Drupal\node\Entity\Node::load(13)->setPublished()->save();

/****************
 ** Menu Items **
 ****************/
// External Link
\Drupal\menu_link_content\Entity\MenuLinkContent::create(["title" => "Submenu link", "link" => ["uri" => "https://google.com"], "menu_name" => "main", "parent" => "menu_link_field:node_field_menulink_e18a741f-7d86-492a-a02f-7ca73989ca13_und", "expanded" => TRUE, "weight" => 0])->save();


/********************
 ** Airtable Items **
 ********************/
$at_menu = \Drupal\menu_link_content\Entity\MenuLinkContent::create(["title" => "Airtable", "link" => ["uri" => "internal:/"], "menu_name" => "main", "parent" => "", "expanded" => TRUE, "weight" => 0]);
$at_menu->save();
$airtable_pages = [
  [
    'title' => 'Service Catalog',
    'wysiwyg_text' => '{"type":"airtable","view": "service_catalog"}',
  ],
  [
    'title' => 'Past Trainings & Workshops',
    'wysiwyg_text' => '{"type":"airtable","view": "training_past"}',
  ],
  [
    'title' => 'Upcoming Trainings & Workshops',
    'wysiwyg_text' => '{"type":"airtable","view": "training_upcoming"}',
  ],
];


foreach ($airtable_pages as $page) {
  // Create Service Catalog Node
  $at_node = \Drupal::entityTypeManager()->getStorage("node")->create([
    "type" => "stanford_page",
    "title" => $page['title'],
  ]);
  $at_node->save();
  
  // Create layout for paragraph for Service Catalog.
  $at_paragraph_layout = \Drupal::entityTypeManager()->getStorage("paragraph")->create([
    "type" => "stanford_layout",
    "parent_id" => $at_node->id(),
    "parent_type" => "node",
    "parent_field_name" => "su_page_components",
  ]);
  
  $at_paragraph_layout->setBehaviorSettings("layout_paragraphs", [
    "layout" => "layout_paragraphs_1_column",
    "config" => [
      "label" => ""
    ],
    "parent_uuid" => "",
    "region" => ""
  ]);
  $at_paragraph_layout->save();
  
  // Create paragraph for Service Catalog
  $at_paragraph = \Drupal::entityTypeManager()->getStorage("paragraph")->create([
    "type" => "stanford_wysiwyg",
    "parent_id" => $at_node->id(),
    "parent_type" => "node",
    "parent_field_name" => "su_page_components",
    "su_wysiwyg_text" => $page['wysiwyg_text'],
  ]);
  
  $at_paragraph->setBehaviorSettings("layout_paragraphs", [
    "parent_uuid" => $at_paragraph_layout->uuid(),
    "region" => "main"
  ]);
  $at_paragraph->save();
  
  // Add paragraph to service catalog node.
  $at_node->su_page_components = [
    [
      "target_id" => $at_paragraph_layout->id(),
      "target_revision_id" => $at_paragraph_layout->getRevisionId()
    ],
    [
      "target_id" => $at_paragraph->id(),
      "target_revision_id" => $at_paragraph->getRevisionId()
    ]
  ];
  $at_node->save();

  // Set Menu
  \Drupal\menu_link_content\Entity\MenuLinkContent::create(["title" => $page['title'], "link" => ["uri" => "internal:/node/" . $at_node->id()], "menu_name" => "main", "parent" => "menu_link_content:" . $at_menu->uuid(), "expanded" => TRUE, "weight" => 0])->save();
}
