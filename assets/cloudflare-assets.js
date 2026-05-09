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
    "salon.mau01.services.treatment": normalizedBase + "/salon/mau-01/salon-mau-01-dv-cham-soc-phuc-hoi.png",

    "salon.mau02.hero": normalizedBase + "/salon/mau-02/salon-mau-02-hero.jpg",
    "salon.mau02.hero02": normalizedBase + "/salon/mau-02/salon-mau-02-hero-02.jpg",
    "salon.mau02.consultation": normalizedBase + "/salon/mau-02/salon-mau-02-consultation.jpg",
    "salon.mau02.colorService": normalizedBase + "/salon/mau-02/salon-mau-02-color-service.jpg",
    "salon.mau02.stylingService": normalizedBase + "/salon/mau-02/salon-mau-02-styling-service.jpg",
    "salon.mau02.treatmentService": normalizedBase + "/salon/mau-02/salon-mau-02-treatment-service.jpg",
    "salon.mau02.space01": normalizedBase + "/salon/mau-02/salon-mau-02-space-01.jpg",
    "salon.mau02.space02": normalizedBase + "/salon/mau-02/salon-mau-02-space-02.jpg",
    "salon.mau02.space03": normalizedBase + "/salon/mau-02/salon-mau-02-space-03.jpg",
    "salon.mau02.experience": normalizedBase + "/salon/mau-02/salon-mau-02-experience.jpg",
    "salon.mau02.products": normalizedBase + "/salon/mau-02/salon-mau-02-products.png",
    "salon.mau02.services.cut": normalizedBase + "/salon/mau-02/salon-mau-02-dv-cat-tao-kieu.jpg",
    "salon.mau02.services.color": normalizedBase + "/salon/mau-02/salon-mau-02-dv-mau-toc.jpg",
    "salon.mau02.services.fashionColor": normalizedBase + "/salon/mau-02/salon-mau-02-dv-nhuom-thoi-trang.jpg",
    "salon.mau02.services.perm": normalizedBase + "/salon/mau-02/salon-mau-02-dv-uon-setting.jpg",
    "salon.mau02.services.straight": normalizedBase + "/salon/mau-02/salon-mau-02-dv-duoi-phuc-hoi.jpg",
    "salon.mau02.services.treatment": normalizedBase + "/salon/mau-02/salon-mau-02-dv-cham-soc-phuc-hoi.jpg",

    "salon.mau03.hero": normalizedBase + "/salon/mau-03/salon-mau-03-hero.png",
    "salon.mau03.hero02": normalizedBase + "/salon/mau-03/salon-mau-03-hero-02.png",
    "salon.mau03.consultation": normalizedBase + "/salon/mau-03/salon-mau-03-consultation.png",
    "salon.mau03.colorService": normalizedBase + "/salon/mau-03/salon-mau-03-color-service.png",
    "salon.mau03.stylingService": normalizedBase + "/salon/mau-03/salon-mau-03-styling-service.png",
    "salon.mau03.treatmentService": normalizedBase + "/salon/mau-03/salon-mau-03-treatment-service.png",
    "salon.mau03.space01": normalizedBase + "/salon/mau-03/salon-mau-03-space-01.png",
    "salon.mau03.space02": normalizedBase + "/salon/mau-03/salon-mau-03-space-02.png",
    "salon.mau03.space03": normalizedBase + "/salon/mau-03/salon-mau-03-space-03.png",
    "salon.mau03.experience": normalizedBase + "/salon/mau-03/salon-mau-03-experience.png",
    "salon.mau03.products": normalizedBase + "/salon/mau-03/salon-mau-03-products.png",
    "salon.mau03.services.cut": normalizedBase + "/salon/mau-03/salon-mau-03-dv-cat-tao-kieu.png",
    "salon.mau03.services.color": normalizedBase + "/salon/mau-03/salon-mau-03-dv-mau-toc.png",
    "salon.mau03.services.fashionColor": normalizedBase + "/salon/mau-03/salon-mau-03-dv-nhuom-thoi-trang.png",
    "salon.mau03.services.perm": normalizedBase + "/salon/mau-03/salon-mau-03-dv-uon-setting.png",
    "salon.mau03.services.straight": normalizedBase + "/salon/mau-03/salon-mau-03-dv-duoi-phuc-hoi.png",
    "salon.mau03.services.treatment": normalizedBase + "/salon/mau-03/salon-mau-03-dv-cham-soc-phuc-hoi.png",

    "salon.mau04.hero": normalizedBase + "/salon/mau-04/salon-mau-04-hero.png",
    "salon.mau04.hero02": normalizedBase + "/salon/mau-04/salon-mau-04-hero-02.png",
    "salon.mau04.consultation": normalizedBase + "/salon/mau-04/salon-mau-04-consultation.png",
    "salon.mau04.colorService": normalizedBase + "/salon/mau-04/salon-mau-04-color-service.png",
    "salon.mau04.stylingService": normalizedBase + "/salon/mau-04/salon-mau-04-styling-service.png",
    "salon.mau04.treatmentService": normalizedBase + "/salon/mau-04/salon-mau-04-treatment-service.png",
    "salon.mau04.space01": normalizedBase + "/salon/mau-04/salon-mau-04-space-01.png",
    "salon.mau04.space02": normalizedBase + "/salon/mau-04/salon-mau-04-space-02.png",
    "salon.mau04.space03": normalizedBase + "/salon/mau-04/salon-mau-04-space-03.png",
    "salon.mau04.experience": normalizedBase + "/salon/mau-04/salon-mau-04-experience.png",
    "salon.mau04.products": normalizedBase + "/salon/mau-04/salon-mau-04-products.png",
    "salon.mau04.services.cut": normalizedBase + "/salon/mau-04/salon-mau-04-dv-cat-tao-kieu.png",
    "salon.mau04.services.color": normalizedBase + "/salon/mau-04/salon-mau-04-dv-mau-toc.png",
    "salon.mau04.services.fashionColor": normalizedBase + "/salon/mau-04/salon-mau-04-dv-nhuom-thoi-trang.png",
    "salon.mau04.services.perm": normalizedBase + "/salon/mau-04/salon-mau-04-dv-uon-setting.png",
    "salon.mau04.services.straight": normalizedBase + "/salon/mau-04/salon-mau-04-dv-duoi-phuc-hoi.png",
    "salon.mau04.services.treatment": normalizedBase + "/salon/mau-04/salon-mau-04-dv-cham-soc-phuc-hoi.png",

    "salon.mau05.hero": normalizedBase + "/salon/mau-05/salon-mau-05-hero.png",
    "salon.mau05.hero02": normalizedBase + "/salon/mau-05/salon-mau-05-hero-02.png",
    "salon.mau05.consultation": normalizedBase + "/salon/mau-05/salon-mau-05-consultation.png",
    "salon.mau05.colorService": normalizedBase + "/salon/mau-05/salon-mau-05-color-service.png",
    "salon.mau05.stylingService": normalizedBase + "/salon/mau-05/salon-mau-05-styling-service.png",
    "salon.mau05.treatmentService": normalizedBase + "/salon/mau-05/salon-mau-05-treatment-service.png",
    "salon.mau05.space01": normalizedBase + "/salon/mau-05/salon-mau-05-space-01.png",
    "salon.mau05.space02": normalizedBase + "/salon/mau-05/salon-mau-05-space-02.png",
    "salon.mau05.space03": normalizedBase + "/salon/mau-05/salon-mau-05-space-03.png",
    "salon.mau05.experience": normalizedBase + "/salon/mau-05/salon-mau-05-experience.png",
    "salon.mau05.products": normalizedBase + "/salon/mau-05/salon-mau-05-products.png",
    "salon.mau05.services.cut": normalizedBase + "/salon/mau-05/salon-mau-05-dv-cat-tao-kieu.png",
    "salon.mau05.services.color": normalizedBase + "/salon/mau-05/salon-mau-05-dv-mau-toc.png",
    "salon.mau05.services.fashionColor": normalizedBase + "/salon/mau-05/salon-mau-05-dv-nhuom-thoi-trang.png",
    "salon.mau05.services.perm": normalizedBase + "/salon/mau-05/salon-mau-05-dv-uon-setting.png",
    "salon.mau05.services.straight": normalizedBase + "/salon/mau-05/salon-mau-05-dv-duoi-phuc-hoi.png",
    "salon.mau05.services.treatment": normalizedBase + "/salon/mau-05/salon-mau-05-dv-cham-soc-phuc-hoi.png"
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
