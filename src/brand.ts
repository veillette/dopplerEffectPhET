import "./splash.js";
import { brand } from "scenerystack/brand";
import type { TBrand } from "scenerystack/brand";
import { logo_png, logoOnWhite_png } from "scenerystack/adapted-from-phet";

const Brand: TBrand = {
  // Nickname for the brand, which should match the brand subdirectory name, grunt option for --brand as well as the
  // query parameter for ?brand.  This is used in Joist to provide brand-specific logic, such as what to show in the
  // About dialog, decorative text around the PhET button, and whether to check for updates.
  id: "adapted-from-phet",

  // Optional string for the name of the brand.  If non-null, the brand name will appear in the top of the About dialog
  // {string} For example: "My Company"
  name: null,

  // Optional string for the copyright statement.  If non-null, it will appear in the About dialog
  // {string} For example: "Copyright © 2014, My Company"
  copyright: null,

  /**
   * Return any links to appear in the About dialog.  The sim name and locale can be used for customization if desired.
   * For example: { textStringProperty: new Property( "My Company Support" ), url: "https://www.mycompany.com/support" }
   */
  getLinks: function () {
    return [];
  },
  logoOnBlackBackground: logo_png,
  logoOnWhiteBackground: logoOnWhite_png,
};

brand.register("Brand", Brand);
