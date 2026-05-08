(function () {
  var base = "https://cdn.thehairlab.top/thehairlab";
  var normalizedBase = base.replace(/\/+$/, "");

  window.THL_CDN_BASE = normalizedBase;

  window.THL_ASSETS = {
    "site.hienThiTimKiem": normalizedBase + "/site/hien-thi-tim-kiem.png",
    "site.productLineup": normalizedBase + "/site/thehairlab-hero-product-lineup.png",

    "salon.mau01.hero": normalizedBase + "/salon/mau-01/salon-mau-01-hero.png",
    "salon.mau01.hero02": normalizedBase + "/salon/mau-01/salon-mau-01-hero-02.png",
    "salon.mau01.consultation": normalizedBase + "/salon/mau-01/salon-mau-01-consultation.png",
    "salon.mau01.colorService": normalizedBase + "/salon/mau-01/salon-mau-01-color-service.png",
    "salon.mau01.stylingService": normalizedBase + "/salon/mau-01/salon-mau-01-styling-service.png",
    "salon.mau01.treatmentService": normalizedBase + "/salon/mau-01/salon-mau-01-treatment-service.png",
    "salon.mau01.space01": normalizedBase + "/salon/mau-01/salon-mau-01-space-01.png",
    "salon.mau01.space02": normalizedBase + "/salon/mau-01/salon-mau-01-space-02.png",
    "salon.mau01.space03": normalizedBase + "/salon/mau-01/salon-mau-01-space-03.png",
    "salon.mau01.experience": normalizedBase + "/salon/mau-01/salon-mau-01-experience.png",
    "salon.mau01.products": normalizedBase + "/salon/mau-01/salon-mau-01-products.png",

    "salon.mau01.services.cut": normalizedBase + "/salon/mau-01/salon-mau-01-dv-cat-tao-kieu.png",
    "salon.mau01.services.color": normalizedBase + "/salon/mau-01/salon-mau-01-dv-mau-toc.png",
    "salon.mau01.services.fashionColor": normalizedBase + "/salon/mau-01/salon-mau-01-dv-nhuom-thoi-trang.png",
    "salon.mau01.services.perm": normalizedBase + "/salon/mau-01/salon-mau-01-dv-uon-setting.png",
    "salon.mau01.services.straight": normalizedBase + "/salon/mau-01/salon-mau-01-dv-duoi-phuc-hoi.png",
    "salon.mau01.services.treatment": normalizedBase + "/salon/mau-01/salon-mau-01-dv-cham-soc-phuc-hoi.png"
  };

  window.thlAsset = function (key, fallback) {
    if (typeof key !== "string" || !key) {
      return fallback || "";
    }

    var mapped = window.THL_ASSETS[key];
    if (typeof mapped === "string" && mapped.trim()) {
      return mapped;
    }

    return fallback || "";
  };
})();
