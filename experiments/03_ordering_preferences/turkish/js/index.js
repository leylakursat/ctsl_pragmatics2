function make_slides(f) {
  var slides = {};

  slides.bot = slide({
    name: "bot",
    start: function () {
      $('.err1').hide();
      $('.err2').hide();
      $('.disq').hide();
      //exp.speaker = _.shuffle(["Ali", "Mehmet", "Onur", "Berke", "Efe", "Cem", "Can", "Burak", "Mustafa", "Mert"])[0];
      //exp.listener = _.shuffle(["Selin", "Zeynep", "Deniz", "Melis", "Yasemin", "Belgin", "Ceren"])[0];

      exp.listener = "beyaz";
      exp.lives = 0;

      //var story = exp.speaker + ', ' + exp.listener + "'e " + '"Bugün hava çok güzel, değil mi?" diyor.'
      var question = "Ayran ne renktir?";
      //document.getElementById("s").innerHTML = story;
      document.getElementById("q").innerHTML = question;
    },
    button: function () {
      exp.text_input = document.getElementById("text_box").value;
      var lower = exp.text_input.toLowerCase();

      if ((exp.lives < 3) && (lower == exp.listener)) {
        exp.data_trials.push({
          "slide_number_in_experiment": exp.phase,
          "trial_type": "bot_check",
          "label": "",
          "object": exp.listener,
          "rt": 0,
          "response": exp.text_input
        });
        exp.go();
      }
      else {
        exp.data_trials.push({
          "slide_number_in_experiment": exp.phase,
          "trial_type": "bot_check",
          "label": "",
          "object": exp.listener,
          "rt": 0,
          "response": exp.text_input
        });
        if (exp.lives == 0) {
          $('.err1').show();
        } if (exp.lives == 1) {
          $('.err1').hide();
          $('.err2').show();
        } if (exp.lives == 2) {
          $('.err2').hide();
          $('.disq').show();
          $('.button').hide();
        }
        exp.lives++;
      }
    },
  });

  slides.i0 = slide({
     name : "i0",
     start: function() {
      exp.startT = Date.now();
     }
  });

  slides.instructions = slide({
    name : "instructions",
    button : function() {
      exp.go(); 
    }
  });

  slides.objecttrial = slide({
    name : "objecttrial",
    present : exp.items,
    start : function() {
	     $(".err").hide();
    },
    present_handle : function(stim) {
      console.log("new trial started");
    	this.trial_start = Date.now();
      $(".err").hide();
      this.init_sliders();
      exp.sliderPost = null;

	    this.stim = stim;
	    console.log(this.stim);
      //var contextsentence = "Which description of the " + this.stim.object +  " sounds more natural?";
      var contextsentence = this.stim.object_tr.charAt(0).toUpperCase() + this.stim.object_tr.slice(1) + " ile ilgili hangi tanım daha doğal duyuluyor?";

      var num = Math.floor(Math.random() * 10); 
      if (num % 2 === 0) {
        exp.right_end_tr = '"' + this.stim.adj1_tr + " " + this.stim.adj2_tr + " " + this.stim.object_tr + '"'
        exp.left_end_tr = '"' + this.stim.adj2_tr + " " + this.stim.adj1_tr + " " + this.stim.object_tr + '"'
        exp.right_end = '"' + this.stim.adj1 + " " + this.stim.adj2 + " " + this.stim.object + '"'
        exp.left_end = '"' + this.stim.adj2 + " " + this.stim.adj1 + " " + this.stim.object + '"'
      } else {
        exp.right_end_tr = '"' + this.stim.adj2_tr + " " + this.stim.adj1_tr + " " + this.stim.object_tr + '"'
        exp.left_end_tr = '"' + this.stim.adj1_tr + " " + this.stim.adj2_tr + " " + this.stim.object_tr + '"'
        exp.right_end = '"' + this.stim.adj2 + " " + this.stim.adj1 + " " + this.stim.object + '"'
        exp.left_end = '"' + this.stim.adj1 + " " + this.stim.adj2 + " " + this.stim.object + '"'
      }

      $("#contextsentence").html(contextsentence);
      //$("#objectimage").html(objimagehtml);
      $("#left_end").html(exp.left_end_tr);
      $("#right_end").html(exp.right_end_tr);
	},

    button : function() {
      if (exp.sliderPost == null) {
        $(".err").show();
      } else if (exp.sliderPost != null) {   
        $(".err").hide();
        this.log_responses();
        _stream.apply(this); //use exp.go() if and only if there is no "present" data.        
      }
    },

    init_sliders : function() {
      utils.make_slider("#single_slider", function(event, ui) {
        exp.sliderPost = ui.value;
      });
    },

    log_responses : function() {
        exp.data_trials.push({
          "slide_number_in_experiment" : exp.phase,
          "label": this.stim.label,
          "object": this.stim.object,
          "adj1": this.stim.adj1,
          "adj2" : this.stim.adj2,
          "right_end" : exp.right_end,
          "left_end" : exp.left_end,
          "right_end_tr" : exp.right_end_tr,
          "left_end_tr" : exp.left_end_tr,
          "rt" : Date.now() - _s.trial_start,
          "response" : [exp.sliderPost]
        });
    }
  });

  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      //if (e.preventDefault) e.preventDefault(); // I don't know what this means.
      exp.subj_data = {
        language : $("#language").val(),
        enjoyment : $("#enjoyment").val(),
        asses : $('input[name="assess"]:checked').val(),
        age : $("#age").val(),
        gender : $("#gender").val(),
        education : $("#education").val(),
        comments : $("#comments").val(),
      };
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.thanks = slide({
    name : "thanks",
    start : function() {
      exp.data= {
          "trials" : exp.data_trials,
          "catch_trials" : exp.catch_trials,
          "system" : exp.system,
          "condition" : exp.condition,
          "subject_information" : exp.subj_data,
          "time_in_minutes" : (Date.now() - exp.startT)/60000
      };
      setTimeout(function() {proliferate.submit(exp.data);}, 1000);
    }
  });

  return slides;
}

/// init ///
function init() {  
  exp.trials = [];
  exp.catch_trials = [];
  exp.condition = {}; //can randomize between subject conditions here
  exp.system = {
      Browser : BrowserDetect.browser,
      OS : BrowserDetect.OS,
      screenH: screen.height,
      screenUH: exp.height,
      screenW: screen.width,
      screenUW: exp.width
    };
  //blocks of the experiment:
  exp.structure=["bot","i0","objecttrial", 'subj_info', 'thanks'];
  //exp.structure=["objecttrial", 'subj_info', 'thanks'];
  // 
  
  exp.data_trials = [];
  //make corresponding slides:
  exp.slides = make_slides(exp);

  exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                    //relies on structure and slides being defined
  $(".nQs").html(exp.nQs);

  $('.slide').hide(); //hide everything

  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#start_button").click(function() {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function() {$("#mustaccept").show();});
      exp.go();
    }
  });

  exp.go(); //show first slide
}
