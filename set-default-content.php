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


/*********************
 ** Pages to Create **
 *********************/
$parent_menu_links = array('main' => '');
$pages = [
  [
    'title' => 'Services',
    'wysiwyg_text' => 'Services Placeholder',
    'menu_parent' => 'main',
  ],
  [
    'title' => 'Service Catalog',
    'wysiwyg_text' => '{"type":"airtable","view": "service_catalog","variables": {"arrayFormatConfig": {"core-service": {"classMap":{"Artificial Intelligence": "darc","Computationally Intensive Research": "darc","Data Acquisition and Governance": "dag","Data Analytics": "darc","Data Onboarding and Storage": "darc","Human Subjects Research": "blab","Library Research Collections": "library","Publication Support": "library","Research Comms": "ro","Research Operations": "ro","Research Planning": "library"}}}}}',
    'menu_parent' => 'Services',
  ],
  [
    'title' => 'Trainings & Workshops',
    'wysiwyg_text' => '{"type":"airtable","view": "training","variables": {"arrayFormatConfig": {"categories": {"classMap":{"Research Data Sources": "library","Library Resources": "library","Data Stewardship": "dag","Data Licensing": "dag tag","Data Onboarding and Storage": "darc","Data Analytics": "darc","Artificial Intelligence": "darc","Research Computing": "darc","Human Subjects Research": "blab","Survey Methodology": "blab","Publication Support": "library","Research Grants": "ro"}}}}}',
    'menu_parent' => 'main',
  ]
];

// Build all the pages.
foreach ($pages as $page) {
  // Create Node
  $node = \Drupal::entityTypeManager()->getStorage("node")->create([
    "type" => "stanford_page",
    "title" => $page['title'],
  ]);
  $node->save();
  
  // Create layout for paragraph.
  $paragraph_layout = \Drupal::entityTypeManager()->getStorage("paragraph")->create([
    "type" => "stanford_layout",
    "parent_id" => $node->id(),
    "parent_type" => "node",
    "parent_field_name" => "su_page_components",
  ]);
  
  $paragraph_layout->setBehaviorSettings("layout_paragraphs", [
    "layout" => "layout_paragraphs_1_column",
    "config" => [
      "label" => ""
    ],
    "parent_uuid" => "",
    "region" => ""
  ]);
  $paragraph_layout->save();
  
  // Create paragraph.
  $paragraph = \Drupal::entityTypeManager()->getStorage("paragraph")->create([
    "type" => "stanford_wysiwyg",
    "parent_id" => $node->id(),
    "parent_type" => "node",
    "parent_field_name" => "su_page_components",
    "su_wysiwyg_text" => $page['wysiwyg_text'],
  ]);
  
  $paragraph->setBehaviorSettings("layout_paragraphs", [
    "parent_uuid" => $paragraph_layout->uuid(),
    "region" => "main"
  ]);
  $paragraph->save();
  
  // Add paragraph to node.
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
  $at_node->save();

  // Set Menu
  $menu = \Drupal\menu_link_content\Entity\MenuLinkContent::create(["title" => $page['title'], "link" => ["uri" => "internal:/node/" . $node->id()], "menu_name" => "main", "parent" => $parent_menu_links[$page['menu_parent']], "expanded" => TRUE, "weight" => 0])->save();
  $parent_menu_links[$page_title] = "menu_link_content:" . $at_menu->uuid();
}
