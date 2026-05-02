import { FileNode, ChatMessage } from './types';

export const mockFileTree: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: 'z_sales_order',
        name: 'Z_SALES_ORDER.abap',
        type: 'file',
        status: 'warning',
        content: `*&---------------------------------------------------------------------*
*& Report Z_SALES_ORDER
*&---------------------------------------------------------------------*
REPORT z_sales_order.

TABLES: vbak, vbap, kna1.

DATA: lt_vbak TYPE TABLE OF vbak,
      ls_vbak TYPE vbak,
      lt_vbap TYPE TABLE OF vbap,
      lv_netwr TYPE vbak-netwr.

* Selection screen
SELECT-OPTIONS: s_vbeln FOR vbak-vbeln,
                s_erdat FOR vbak-erdat,
                s_kunnr FOR vbak-kunnr.

PARAMETERS: p_bukrs TYPE vbak-bukrs OBLIGATORY.

START-OF-SELECTION.

* Fetch sales order header data
  SELECT * FROM vbak INTO TABLE lt_vbak
    WHERE vbeln IN s_vbeln
      AND erdat IN s_erdat
      AND kunnr IN s_kunnr
      AND bukrs = p_bukrs.

  IF sy-subrc <> 0.
    MESSAGE 'No data found' TYPE 'I'.
    RETURN.
  ENDIF.

* Process each sales order
  LOOP AT lt_vbak INTO ls_vbak.
    WRITE: / ls_vbak-vbeln, ls_vbak-erdat, ls_vbak-kunnr,
             ls_vbak-netwr CURRENCY ls_vbak-waerk.
             
* Get customer name using deprecated function
    CALL FUNCTION 'SD_CUSTOMER_MAINTAIN_ALL'
      EXPORTING
        i_kunnr = ls_vbak-kunnr
      TABLES
        t_kna1  = lt_vbap.
        
* Calculate totals using old method
    lv_netwr = lv_netwr + ls_vbak-netwr.
  ENDLOOP.

* Display totals using deprecated statement
  WRITE: / 'Total Net Value:', lv_netwr.
  
END-OF-SELECTION.`,
        suggestedContent: `*&---------------------------------------------------------------------*
*& Report Z_SALES_ORDER
*&---------------------------------------------------------------------*
REPORT z_sales_order.

* S/4HANA: Avoid TABLES statement - use TYPE declarations instead
DATA: lt_vbak TYPE TABLE OF vbak,
      ls_vbak TYPE vbak,
      lt_vbap TYPE TABLE OF vbap,
      lv_netwr TYPE vbak-netwr.

* Selection screen
SELECT-OPTIONS: s_vbeln FOR vbak-vbeln,
                s_erdat FOR vbak-erdat,
                s_kunnr FOR vbak-kunnr.

PARAMETERS: p_bukrs TYPE vbak-bukrs OBLIGATORY.

START-OF-SELECTION.

* S/4HANA: Use new ABAP SQL syntax with inline declarations
  SELECT vbeln, erdat, kunnr, netwr, waerk 
    FROM vbak 
    INTO TABLE @DATA(lt_orders)
    WHERE vbeln IN @s_vbeln
      AND erdat IN @s_erdat
      AND kunnr IN @s_kunnr
      AND bukrs = @p_bukrs.

  IF sy-subrc <> 0.
    MESSAGE 'No data found' TYPE 'I'.
    RETURN.
  ENDIF.

* Process each sales order
  LOOP AT lt_orders INTO DATA(ls_order).
    WRITE: / ls_order-vbeln, ls_order-erdat, ls_order-kunnr,
             ls_order-netwr CURRENCY ls_order-waerk.
             
* S/4HANA: Use Business Partner API instead of deprecated function
    DATA(lo_bp_api) = cl_md_bp_maintain=>get_instance( ).
    DATA(ls_bp_data) = lo_bp_api->get_data( iv_partner = ls_order-kunnr ).
        
* Calculate totals
    lv_netwr = lv_netwr + ls_order-netwr.
  ENDLOOP.

* Display totals
  WRITE: / 'Total Net Value:', lv_netwr.
  
END-OF-SELECTION.`,
        analysis: {
          summary: 'This report requires modifications for S/4HANA compatibility. Found 3 issues requiring attention.',
          issues: [
            {
              line: 7,
              type: 'deprecated',
              message: 'TABLES statement is obsolete in S/4HANA',
              suggestion: 'Replace with TYPE declarations for database tables'
            },
            {
              line: 38,
              type: 'incompatible',
              message: 'Function SD_CUSTOMER_MAINTAIN_ALL is deprecated',
              suggestion: 'Use Business Partner API (cl_md_bp_maintain) instead'
            },
            {
              line: 21,
              type: 'performance',
              message: 'Consider using new ABAP SQL syntax for better performance',
              suggestion: 'Use inline declarations with @ escaping'
            }
          ],
          recommendations: [
            'Replace TABLES declarations with explicit TYPE declarations',
            'Migrate to Business Partner APIs for customer data',
            'Adopt new ABAP SQL syntax with inline declarations',
            'Consider using CDS views for data access'
          ],
          migrationEffort: 'medium'
        }
      },
      {
        id: 'z_material_master',
        name: 'Z_MATERIAL_MASTER.abap',
        type: 'file',
        status: 'error',
        content: `*&---------------------------------------------------------------------*
*& Report Z_MATERIAL_MASTER
*&---------------------------------------------------------------------*
REPORT z_material_master.

TABLES: mara, marc, mard, mbew.

DATA: BEGIN OF gt_material OCCURS 0,
        matnr TYPE mara-matnr,
        mtart TYPE mara-mtart,
        mbrsh TYPE mara-mbrsh,
        meins TYPE mara-meins,
        werks TYPE marc-werks,
        lgort TYPE mard-lgort,
        labst TYPE mard-labst,
        stprs TYPE mbew-stprs,
      END OF gt_material.

* Internal table with header line (deprecated)
DATA: lt_mara TYPE TABLE OF mara WITH HEADER LINE.

SELECT-OPTIONS: s_matnr FOR mara-matnr,
                s_mtart FOR mara-mtart.

START-OF-SELECTION.

* Old style nested SELECT
  SELECT * FROM mara INTO TABLE lt_mara
    WHERE matnr IN s_matnr
      AND mtart IN s_mtart.

  LOOP AT lt_mara.
    SELECT SINGLE * FROM marc INTO CORRESPONDING FIELDS OF gt_material
      WHERE matnr = lt_mara-matnr.
      
    SELECT SINGLE labst FROM mard INTO gt_material-labst
      WHERE matnr = lt_mara-matnr
        AND werks = gt_material-werks.
        
    APPEND gt_material.
  ENDLOOP.

* Use of MOVE-CORRESPONDING (potential issues)
  MOVE-CORRESPONDING lt_mara TO gt_material.

* Display output
  LOOP AT gt_material.
    WRITE: / gt_material-matnr, gt_material-mtart,
             gt_material-labst, gt_material-stprs.
  ENDLOOP.`,
        suggestedContent: `*&---------------------------------------------------------------------*
*& Report Z_MATERIAL_MASTER
*&---------------------------------------------------------------------*
REPORT z_material_master.

* S/4HANA: Remove TABLES, use proper type declarations
TYPES: BEGIN OF ty_material,
         matnr TYPE matnr,
         mtart TYPE mtart,
         mbrsh TYPE mbrsh,
         meins TYPE meins,
         werks TYPE werks_d,
         lgort TYPE lgort_d,
         labst TYPE labst,
         stprs TYPE stprs,
       END OF ty_material.

DATA: gt_material TYPE TABLE OF ty_material,
      gs_material TYPE ty_material.

SELECT-OPTIONS: s_matnr FOR gs_material-matnr,
                s_mtart FOR gs_material-mtart.

START-OF-SELECTION.

* S/4HANA: Use JOIN instead of nested SELECTs
  SELECT m~matnr, m~mtart, m~mbrsh, m~meins,
         c~werks, d~lgort, d~labst, b~stprs
    FROM mara AS m
    LEFT JOIN marc AS c ON c~matnr = m~matnr
    LEFT JOIN mard AS d ON d~matnr = m~matnr AND d~werks = c~werks
    LEFT JOIN mbew AS b ON b~matnr = m~matnr AND b~bwkey = c~werks
    INTO TABLE @gt_material
    WHERE m~matnr IN @s_matnr
      AND m~mtart IN @s_mtart.

IF sy-subrc <> 0.
  MESSAGE 'No materials found' TYPE 'I'.
  RETURN.
ENDIF.

* Display output using new loop syntax
LOOP AT gt_material INTO gs_material.
  WRITE: / gs_material-matnr, gs_material-mtart,
           gs_material-labst, gs_material-stprs.
ENDLOOP.`,
        analysis: {
          summary: 'Critical issues found. This report uses multiple deprecated patterns that must be changed for S/4HANA.',
          issues: [
            {
              line: 7,
              type: 'deprecated',
              message: 'TABLES statement is obsolete',
              suggestion: 'Remove TABLES and use explicit type declarations'
            },
            {
              line: 9,
              type: 'incompatible',
              message: 'Internal tables with header lines are not supported',
              suggestion: 'Use separate work area for table operations'
            },
            {
              line: 21,
              type: 'deprecated',
              message: 'WITH HEADER LINE is obsolete',
              suggestion: 'Declare table and work area separately'
            },
            {
              line: 30,
              type: 'performance',
              message: 'Nested SELECT statements cause performance issues',
              suggestion: 'Use JOIN operations in a single SELECT'
            },
            {
              line: 43,
              type: 'deprecated',
              message: 'APPEND without explicit target is deprecated',
              suggestion: 'Use APPEND wa TO itab syntax'
            }
          ],
          recommendations: [
            'Remove all TABLES declarations',
            'Eliminate internal tables with header lines',
            'Replace nested SELECTs with JOIN operations',
            'Use explicit work areas for all table operations',
            'Consider creating CDS views for complex data retrieval'
          ],
          migrationEffort: 'high'
        }
      },
      {
        id: 'z_fi_posting',
        name: 'Z_FI_POSTING.abap',
        type: 'file',
        status: 'compatible',
        content: `*&---------------------------------------------------------------------*
*& Report Z_FI_POSTING
*&---------------------------------------------------------------------*
REPORT z_fi_posting.

CLASS lcl_fi_posting DEFINITION.
  PUBLIC SECTION.
    METHODS: post_document
               IMPORTING iv_bukrs TYPE bukrs
                         iv_gjahr TYPE gjahr
               RETURNING VALUE(rv_belnr) TYPE belnr_d.
ENDCLASS.

CLASS lcl_fi_posting IMPLEMENTATION.
  METHOD post_document.
    DATA: ls_header TYPE bapi_acc_document_header,
          lt_items  TYPE TABLE OF bapi_acc_document_item,
          lt_return TYPE TABLE OF bapiret2.
    
    ls_header-comp_code = iv_bukrs.
    ls_header-fisc_year = iv_gjahr.
    ls_header-doc_date  = sy-datum.
    ls_header-pstng_date = sy-datum.
    ls_header-doc_type  = 'SA'.
    
    CALL FUNCTION 'BAPI_ACC_DOCUMENT_POST'
      EXPORTING
        documentheader = ls_header
      TABLES
        accountgl      = lt_items
        return         = lt_return.
        
    READ TABLE lt_return WITH KEY type = 'E' TRANSPORTING NO FIELDS.
    IF sy-subrc <> 0.
      CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
        EXPORTING
          wait = abap_true.
      rv_belnr = ls_header-obj_key+0(10).
    ENDIF.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA(lo_posting) = NEW lcl_fi_posting( ).
  DATA(lv_doc) = lo_posting->post_document( 
    iv_bukrs = '1000'
    iv_gjahr = sy-datum+0(4) 
  ).
  
  IF lv_doc IS NOT INITIAL.
    WRITE: / 'Document posted:', lv_doc.
  ENDIF.`,
        suggestedContent: `*&---------------------------------------------------------------------*
*& Report Z_FI_POSTING
*&---------------------------------------------------------------------*
REPORT z_fi_posting.

CLASS lcl_fi_posting DEFINITION.
  PUBLIC SECTION.
    METHODS: post_document
               IMPORTING iv_bukrs TYPE bukrs
                         iv_gjahr TYPE gjahr
               RETURNING VALUE(rv_belnr) TYPE belnr_d.
ENDCLASS.

CLASS lcl_fi_posting IMPLEMENTATION.
  METHOD post_document.
    DATA: ls_header TYPE bapi_acc_document_header,
          lt_items  TYPE TABLE OF bapi_acc_document_item,
          lt_return TYPE TABLE OF bapiret2.
    
    ls_header-comp_code = iv_bukrs.
    ls_header-fisc_year = iv_gjahr.
    ls_header-doc_date  = sy-datum.
    ls_header-pstng_date = sy-datum.
    ls_header-doc_type  = 'SA'.
    
    CALL FUNCTION 'BAPI_ACC_DOCUMENT_POST'
      EXPORTING
        documentheader = ls_header
      TABLES
        accountgl      = lt_items
        return         = lt_return.
        
    READ TABLE lt_return WITH KEY type = 'E' TRANSPORTING NO FIELDS.
    IF sy-subrc <> 0.
      CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
        EXPORTING
          wait = abap_true.
      rv_belnr = ls_header-obj_key+0(10).
    ENDIF.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA(lo_posting) = NEW lcl_fi_posting( ).
  DATA(lv_doc) = lo_posting->post_document( 
    iv_bukrs = '1000'
    iv_gjahr = sy-datum+0(4) 
  ).
  
  IF lv_doc IS NOT INITIAL.
    WRITE: / 'Document posted:', lv_doc.
  ENDIF.`,
        analysis: {
          summary: 'This report is already S/4HANA compatible. Uses modern ABAP OO patterns and stable BAPIs.',
          issues: [],
          recommendations: [
            'Code follows S/4HANA best practices',
            'Consider adding error handling for BAPI calls',
            'Optional: Migrate to new Finance APIs for enhanced features'
          ],
          migrationEffort: 'low'
        }
      }
    ]
  },
  {
    id: 'includes',
    name: 'includes',
    type: 'folder',
    children: [
      {
        id: 'z_common_macros',
        name: 'Z_COMMON_MACROS.abap',
        type: 'file',
        status: 'error',
        content: `*&---------------------------------------------------------------------*
*& Include Z_COMMON_MACROS
*&---------------------------------------------------------------------*

* Deprecated FIELD-SYMBOLS without type
FIELD-SYMBOLS: <fs>.

* Macros (discouraged in S/4HANA)
DEFINE fill_table.
  CLEAR &1.
  &1-field1 = &2.
  &1-field2 = &3.
  APPEND &1 TO &4.
END-OF-DEFINITION.

* Obsolete type pools
TYPE-POOLS: slis, icon.

* Old ALV function modules usage
DATA: lt_fieldcat TYPE slis_t_fieldcat_alv,
      ls_layout   TYPE slis_layout_alv.`,
        suggestedContent: `*&---------------------------------------------------------------------*
*& Include Z_COMMON_MACROS
*&---------------------------------------------------------------------*

* S/4HANA: Use typed FIELD-SYMBOLS
FIELD-SYMBOLS: <fs_data> TYPE any.

* S/4HANA: Replace macros with methods
CLASS lcl_table_helper DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS fill_entry
      IMPORTING iv_field1 TYPE any
                iv_field2 TYPE any
      CHANGING  ct_table  TYPE ANY TABLE.
ENDCLASS.

CLASS lcl_table_helper IMPLEMENTATION.
  METHOD fill_entry.
    DATA: ls_line TYPE REF TO data.
    CREATE DATA ls_line LIKE LINE OF ct_table.
    ASSIGN ls_line->* TO FIELD-SYMBOL(<fs_line>).
    ASSIGN COMPONENT 'FIELD1' OF STRUCTURE <fs_line> TO FIELD-SYMBOL(<fv_f1>).
    ASSIGN COMPONENT 'FIELD2' OF STRUCTURE <fs_line> TO FIELD-SYMBOL(<fv_f2>).
    IF <fv_f1> IS ASSIGNED AND <fv_f2> IS ASSIGNED.
      <fv_f1> = iv_field1.
      <fv_f2> = iv_field2.
      APPEND <fs_line> TO ct_table.
    ENDIF.
  ENDMETHOD.
ENDCLASS.

* S/4HANA: Use SALV classes instead of function modules
* TYPE-POOLS are no longer needed - types are globally available
DATA: go_alv TYPE REF TO cl_salv_table.`,
        analysis: {
          summary: 'This include contains multiple deprecated patterns that are incompatible with S/4HANA.',
          issues: [
            {
              line: 6,
              type: 'deprecated',
              message: 'Untyped FIELD-SYMBOLS are deprecated',
              suggestion: 'Always specify TYPE for FIELD-SYMBOLS'
            },
            {
              line: 9,
              type: 'deprecated',
              message: 'DEFINE macros are discouraged in S/4HANA',
              suggestion: 'Replace macros with class methods'
            },
            {
              line: 17,
              type: 'incompatible',
              message: 'TYPE-POOLS statement is obsolete',
              suggestion: 'Remove TYPE-POOLS - types are globally available'
            },
            {
              line: 20,
              type: 'deprecated',
              message: 'SLIS types for ALV are deprecated',
              suggestion: 'Use SALV classes (cl_salv_table) instead'
            }
          ],
          recommendations: [
            'Replace macros with proper class methods',
            'Remove TYPE-POOLS declarations',
            'Migrate ALV implementations to SALV classes',
            'Add explicit types to all FIELD-SYMBOLS'
          ],
          migrationEffort: 'high'
        }
      }
    ]
  },
  {
    id: 'config',
    name: 'config',
    type: 'folder',
    children: [
      {
        id: 'transport_config',
        name: 'transport_config.xml',
        type: 'file',
        status: 'compatible',
        content: `<?xml version="1.0" encoding="UTF-8"?>
<transport>
  <request>DEVK900123</request>
  <description>Z_SALES_ORDER migration</description>
  <target_system>PRD</target_system>
  <objects>
    <object type="PROG" name="Z_SALES_ORDER"/>
    <object type="PROG" name="Z_MATERIAL_MASTER"/>
    <object type="PROG" name="Z_FI_POSTING"/>
  </objects>
</transport>`,
        analysis: {
          summary: 'Configuration file - no code changes required.',
          issues: [],
          recommendations: ['Update transport description after migration'],
          migrationEffort: 'low'
        }
      }
    ]
  }
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Welcome to the SAP Migration Analyzer! I can help you understand the changes needed to migrate your ABAP code from ECC to S/4HANA. Select a file from the explorer to begin analysis, or ask me any questions about SAP migration best practices.',
    timestamp: new Date()
  }
];

export const mockAIResponses: Record<string, string[]> = {
  default: [
    "I can help you understand the migration requirements for your ABAP code. What specific aspect would you like me to explain?",
    "Based on S/4HANA compatibility guidelines, here are the key areas to focus on for your migration.",
    "Let me analyze that code pattern and suggest the recommended S/4HANA approach."
  ],
  z_sales_order: [
    "This sales order report uses the deprecated TABLES statement and an obsolete customer function. The key changes needed are:\n\n1. **Remove TABLES declaration** - Use TYPE declarations instead\n2. **Replace SD_CUSTOMER_MAINTAIN_ALL** - This function is deprecated. Use the Business Partner API (cl_md_bp_maintain) instead\n3. **Adopt new SQL syntax** - Use inline declarations with @ escaping for better performance",
    "The SD_CUSTOMER_MAINTAIN_ALL function was replaced in S/4HANA because customer data now uses the Business Partner model. You'll need to use cl_md_bp_maintain->get_data() to retrieve customer information.",
    "For the SELECT statement, I recommend using the new ABAP 7.40+ syntax:\n```abap\nSELECT vbeln, erdat, kunnr\n  FROM vbak\n  INTO TABLE @DATA(lt_orders)\n  WHERE vbeln IN @s_vbeln.\n```\nThis provides better readability and performance."
  ],
  z_material_master: [
    "This material master report has critical compatibility issues:\n\n1. **Internal tables with header lines** - Not supported in S/4HANA. You must use separate work areas.\n2. **Nested SELECT statements** - Causing performance issues. Replace with JOIN operations.\n3. **OCCURS 0 clause** - Deprecated syntax that must be removed.",
    "The nested SELECT pattern you're using will cause significant performance issues in S/4HANA due to the simplified data model. Here's how to convert to a JOIN:\n```abap\nSELECT m~matnr, c~werks, d~labst\n  FROM mara AS m\n  LEFT JOIN marc AS c ON c~matnr = m~matnr\n  LEFT JOIN mard AS d ON d~matnr = m~matnr\n  INTO TABLE @DATA(lt_material).\n```",
    "For material stock data in S/4HANA, consider using CDS views like I_MaterialStock or I_MaterialStockByWarehouse for better integration with the Fiori apps."
  ],
  z_fi_posting: [
    "Great news! This FI posting report is already S/4HANA compatible. It follows modern ABAP OO patterns and uses stable BAPIs that are supported in S/4HANA.",
    "The BAPI_ACC_DOCUMENT_POST is still fully supported in S/4HANA. However, you might want to explore the new Finance APIs for additional capabilities.",
    "Your code already uses best practices like:\n- Class-based design\n- Proper error handling with BAPIRET2\n- BAPI_TRANSACTION_COMMIT for database commits"
  ],
  z_common_macros: [
    "This include file needs significant refactoring:\n\n1. **DEFINE macros** - Should be replaced with class methods for better maintainability and debugging\n2. **TYPE-POOLS** - No longer needed in S/4HANA as types are globally available\n3. **SLIS ALV types** - Should migrate to SALV classes (cl_salv_table)",
    "Here's how to convert your macro to a class method:\n```abap\nCLASS lcl_helper DEFINITION.\n  PUBLIC SECTION.\n    CLASS-METHODS fill_entry\n      IMPORTING iv_field1 TYPE any\n                iv_field2 TYPE any\n      CHANGING ct_table TYPE ANY TABLE.\nENDCLASS.\n```",
    "For ALV migration, replace the function module approach with SALV:\n```abap\nDATA: go_alv TYPE REF TO cl_salv_table.\ncl_salv_table=>factory(\n  IMPORTING r_salv_table = go_alv\n  CHANGING t_table = lt_data ).\ngo_alv->display( ).\n```"
  ]
};

export function getAIResponse(fileId: string | null, userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for specific keywords
  if (lowerMessage.includes('tables') || lowerMessage.includes('declaration')) {
    return "The TABLES statement creates implicit work areas that are tied to database tables. In S/4HANA, this is deprecated because:\n\n1. It creates hidden dependencies on database structures\n2. Makes code harder to maintain and test\n3. Can cause issues with the simplified data model\n\n**Solution:** Replace with explicit TYPE declarations:\n```abap\n* Instead of: TABLES: vbak.\n* Use:\nDATA: ls_vbak TYPE vbak.\n```";
  }
  
  if (lowerMessage.includes('business partner') || lowerMessage.includes('customer') || lowerMessage.includes('vendor')) {
    return "In S/4HANA, customers and vendors are unified under the Business Partner model. Key changes:\n\n1. **Table changes:** KNA1/LFA1 → BUT000 (Business Partner master)\n2. **APIs:** Use cl_md_bp_maintain instead of SD/MM customer/vendor functions\n3. **Relationships:** Customer/Vendor roles are now BP role categories\n\nThis unification enables:\n- Single source of truth for business partners\n- Better integration across modules\n- Simplified master data maintenance";
  }
  
  if (lowerMessage.includes('performance') || lowerMessage.includes('optimize')) {
    return "Key performance optimization strategies for S/4HANA:\n\n1. **Code Pushdown:** Move calculations to the database layer using CDS views\n2. **Avoid nested loops:** Use JOIN operations instead\n3. **Use new SQL syntax:** Inline declarations reduce memory operations\n4. **Buffer carefully:** S/4HANA's in-memory architecture changes buffering strategies\n\n```abap\n* Example of optimized code:\nSELECT a~field1, SUM( b~amount ) AS total\n  FROM table_a AS a\n  INNER JOIN table_b AS b ON a~key = b~key\n  INTO TABLE @DATA(lt_result)\n  GROUP BY a~field1.\n```";
  }
  
  // File-specific responses
  if (fileId && mockAIResponses[fileId]) {
    const responses = mockAIResponses[fileId];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Default responses
  const defaultResponses = mockAIResponses.default;
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

export function flattenFileTree(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  
  function traverse(node: FileNode) {
    if (node.type === 'file') {
      result.push(node);
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  }
  
  nodes.forEach(traverse);
  return result;
}

export function findFileById(nodes: FileNode[], id: string): FileNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findFileById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}
