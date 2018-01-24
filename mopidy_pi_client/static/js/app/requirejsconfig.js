define({
    paths: {
        "mopidy": "../../mopidy/mopidy",
        "jquery": "lib/jquery-2.2.4.min",
        "jquery-ui": "lib/jquery-ui-1.12.1.custom/jquery-ui.min",
        "jquery-mobile": "lib/jquery.mobile-1.4.5.min",
        "bootstrap": "lib/bootstrap.min",
        "coverflowjs": "lib/coverflowjs-3.0.2.min"
    },
    shim: {
        "jquery-ui": ["jquery"],
        "jquery-mobile": ["jquery", "jquery-ui"],
        "coverflowjs": ["jquery", "jquery-ui", "jquery-mobile"],
        "bootstrap": ["jquery"]
    }
});
