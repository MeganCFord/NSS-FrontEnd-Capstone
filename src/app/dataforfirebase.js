//TODO: move this data into firebase
      
    function addMyOwnData(taxa) {
      const currentTaxa = taxa;
      switch(taxa.name) {
        //CHORDATA SUBTAXA
      case "Actinopterygii":
        currentTaxa.question = "is a fish with fins that are webs of skin supported by bony spines.";
        currentTaxa.enableMe=false;
        break;
      case "Amphibia": 
        currentTaxa.question = "is probably an amphibian: it has slimy skin with no scales or fur/hair, and goes through a metamorphosis from an egg laid in water to adult form.";
        currentTaxa.enableMe=false;
        break;
      case "Appendicularia":
        currentTaxa.question = "is a tiny clear plankton that usually floats near the ocean's surface and filters seawater through a sac to eat.";
        currentTaxa.enableMe=false;
        break;
      case "Ascidiacea":
        currentTaxa.question = "is attached to a rock in the ocean and filters seawater through a sac to eat.";
        currentTaxa.enableMe=false;
        break;
      case "Aves":
        currentTaxa.question = "has feathers and wings.";
        currentTaxa.enableMe=false;
        break;
      case "Cephalaspidomorphi":
        currentTaxa.question = "is fish with a sucker mouth and no jaw.";
        currentTaxa.enableMe=false;
        break;
      case "Elasmobranchii":
        currentTaxa.question = "is a fish with cartilage instead of bones and a bony jaw separate from its skull- probably a shark or ray.";
        currentTaxa.enableMe=false;
        break;
      case "Holocephali":
        currentTaxa.question = "is a fish with cartilage instead of bones, a long, whiplike tail, and a small, fleshy mouth." ;
        currentTaxa.enableMe=false;
        break;
      case "Leptocardii":
        currentTaxa.question = "is a 2-3 inch long worm-shaped fish with no fins, a poorly-shaped tail, and only a little cartilage stiffening its gills.";
        currentTaxa.enableMe=false;
        break;
      case "Mammalia": 
        currentTaxa.question = "has fur or hair and gives birth to its babies.";
        currentTaxa.enableMe=true;
        break;
      case "Myxini": 
        currentTaxa.question = "is a slimy eel-shaped fish with eye spots, a cartilaginous skull, one nostril but no spinal bones.";
        currentTaxa.enableMe=false;
        break;
      case "Reptilia":
        currentTaxa.question = "is a reptile, so it's probably dry and has scales.";
        currentTaxa.enableMe=true;
        break;
      case "Sarcopterygii":
        currentTaxa.question = "is a bony fish with lobed fins attached to the body by a single bone.";
        currentTaxa.enableMe=true;
        break;
      case "Thaliacea":
        currentTaxa.question = "is a small, free-floating sac-like creature that filters seawater for food and propulsion.";
        currentTaxa.enableMe=false;
        break;
      default: ;
        currentTaxa.enableMe=true;
      }
      return taxa;
    }
