import Work1 from "./works/work1";
import Work2 from "./works/work2";
import Work3 from "./works/work3";
import Work4 from "./works/work4";
import Work5 from "./works/work5";
import Work6 from "./works/work6";
import Work7 from "./works/work7";
import Work9 from "./works/work9";
import Work10 from "./works/work10";
import Work11 from "./works/work11";
import Work12 from "./works/work12";
import Work13 from "./works/work13";
import Work14 from "./works/work14";
import Work15 from "./works/work15";

import Mark from "./Components/Bookmarkbar/mark";

//total no of Works == x
const x = 14;

export const data = [
  {
    index: x - 14,
    img: "/images/works/gp/topimg2.jpg",
    title: "Gradation Project - Arvind Ltd.",
    category: "Apparel",
    topimg: "/images/works/gp/topimg2.jpg",
    bottomimg: "/images/works/gp/bottomimg.jpg",
    description: 
    (
      <>
        {`Here is a complete report of the 4-month internship/Graduation Project sponsored by Arvind Ltd, Santej.`}
        {/* <br /><br /> 
        {`It features a range of bed linen and table linen products, including a throw, a bedsheet, pillowcases, cushion covers, a sham, curtains, placemats, a tablecloth, a table runner and napkins.`} */}
      </>
    ),
    body: <Work15 />,
    bookmarks: (
      <>
        <Mark to="#overview" title="Overview" />
        <Mark to="#certificate" title="Certificate" />
        {/* <Mark to="#contents" title="Contents" /> */}
        <Mark to="#arvind" title="Arvind" />
        <Mark to="#collection_one" title="Collection 1" />
        <Mark to="#swatches_one" title="Swatches" />
        <Mark to="#collection_two" title="Collection 2" />
        <Mark to="#swatches_two" title="Swatches" />
        <Mark to="#shirting_cads" title="Shirting CADs" />


      </>
    ),
  },
  {
    index: x - 13,
    img: "/images/works/tarang/topimg2.jpg",
    title: "Tarang - Bandhani Collection",
    category: "Home Furnishing",
    topimg: "/images/works/tarang/topimg2.jpg",
    bottomimg: "/images/works/tarang/img (56).jpg",
    description: (
      <>
        
        {`"Tarang" is a collaborative home collection designed by Textile Design students of NIFT Gandhinagar and crafted by skilful Bandhani Artisans of Jamnagar, Gujrat. This collection depicts the mischievous nature of waves by randomly arranging bandhani dots on a piece of fabric. 
    `}
        <br /><br /> 
        {`It features a range of bed linen and table linen products, including a throw, a bedsheet, pillowcases, cushion covers, a sham, curtains, placemats, a tablecloth, a table runner and napkins.`}
        {/* {` Raw materials like dyes, thread for tying, and fabric; were sourced from the local market and provided to the artisans.`}  */}
      </>
    ),
    body: <Work14 />,
    bookmarks: (
      <>
        <Mark to="#overview" title="Overview" />
        <Mark to="#artisans" title="Artisans" />
        <Mark to="#product_board" title="Poduct Board" />
        <Mark to="#theme" title="Theme" />
        <Mark to="#concepts" title="Concepts" />
        <Mark to="#final_collection" title="Final Collection" />
        <Mark to="#student_profiles" title="Student Profiles" />

      </>
    ),
  },

  {
    index: x - 12,
    img: "/images/works/jacquard/two.jpg",
    title: "Jacquard Gallery",
    category: "Weave Design",
    topimg: "/images/works/jacquard/two.jpg",
    bottomimg: "/images/works/jacquard/three.jpg",
    description:
      "Here is an image gallery of all the jacquard designs I created in various internship projects. For creating and editing artwork, I used Adobe Photoshop and Illustrator. And for mapping weaves, I used CAD tools like Textronics-Design Jacquard and Pointcarre. ",
    body: <Work13 />,
    bookmarks: (
      <>
        <Mark to="#overview" title="Overview" />
        {/* <Mark to="#illusions" title="Illusions" />
        <Mark to="#colour_palette" title="Colour Palette" />
        <Mark to="#cutdc" title="Cut Double Cloth" />
        <Mark to="#stitcheddc" title="Stitched Double Cloth" /> */}
      </>
    ),
  },

  {
    index: x - 11,
    img: "/images/works/illusions/frontimg.webp",
    title: "Maya - The Art of Deception",
    category: "Weave design",
    topimg: "/images/works/illusions/frontimg.webp",
    bottomimg: "/images/works/illusions/bottomimg.webp",
    description: (
      <>
        {`Illusions trick our senses and deceive our perception to see things, similar to how "Maya", all the shiny things around us, prevents us from understanding the true nature of life and reality. And the irony is that we can't deny our needs even after knowing that. It is important to recognize that our temporary needs and desires are a natural part of being human, and we can accept them in a dignified manner.
`}{" "}
        <br /> <br />
        {`This project explores the theme of illusions and features a series of fabric swatches inspired by various types of illusions. Weaving Techniques of Double Cloth and Hand Carpet Making are explored in this project.`}
      </>
    ),
    body: <Work12 />,
    bookmarks: (
      <>
        <Mark to="#overview" title="Overview" />
        <Mark to="#illusions" title="Illusions" />
        <Mark to="#colour_palette" title="Colour Palette" />
        <Mark to="#cutdc" title="Cut Double Cloth" />
        <Mark to="#stitcheddc" title="Stitched Double Cloth" />
        <Mark to="#waddeddc" title="Wadded Double Cloth" />
        <Mark to="#carpets" title="Carpet swatches" />
        <Mark to="#jacquard" title="Jacquard Designs" />
        <Mark to="#altogether" title="Altogether" />
      </>
    ),
  },

  {
    index: x - 10,
    img: "/images/works/internship/topimg.webp",
    title: "Internship Experience at Raymond Limited",
    category: "Suiting Design",
    topimg: "/images/works/internship/topimg.webp",
    bottomimg: "/images/works/internship/bottomimg.webp",
    description: (
      <>
        {`I completed my two-month summer internship at Raymond Limited, Thane. I worked on the Suiting Design Development project for the SS-23 Collection, for which I did trend research, created a mood board and a colour board, and created suiting designs. A few of my designs were selected by the Head of design for Raymond's subsidiary brand, Champion's spring/summer 2023 collection.`}
        <br />
        <br /> {`Learnings from the internship⁚`} <br />
        {
          <ul>
            <li>
              Learned about the working of the department and the design process
              followed in the brand.
            </li>
            <li>
              Got to do fabric analysis and learned to do fabric calculations
              and fabric costing.
            </li>
            <li>
              Worked on Textronics-Design Dobby software, the best tool for
              creating realistic fabric simulations.
            </li>
            <li>Learned about Jacquard and compound weave structures.</li>
            <li>
              Got to work with different materials, weave structures, and
              patterns.
            </li>
            <li>
              And got a brief overview of various other departments like the
              Fabric Testing Lab, Quality Assurance, Shirting and Lifestyle
              Product Department.
            </li>
          </ul>
        }
      </>
    ),
    body: <Work10 />,
    bookmarks: (
      <>
        <Mark to="#overview" title="Overview" />
        <Mark to="#certificate" title="Certificate" />
        <Mark to="#brief" title="Brief" />

        <Mark to="#moodboard" title="Mood Board" />
        <Mark to="#colourboard" title="Colour Palette" />
        <Mark to="#cad" title="CAD" />
        <Mark to="#nccard" title="NC Card" />

        <Mark to="#jacquard" title="Jacquard" />
      </>
    ),
  },

  {
    index: x - 9,
    img: "/images/works/weave_design/weavedesign.webp",
    title: "Checks and Stripes",
    category: "Weave design",
    topimg: "/images/works/weave_design/weavedesign.webp",
    bottomimg: "/images/works/weave_design/bottom_img.jpg",
    description: (
      <>
        {`Woven swatches inspired by Amrita Shergill's painting "Group of Three
    Girls". Her artwork won her a gold medal from the Bombay Art Society.
    National Gallery of Modern Art (NGMA), New Delhi. She mainly painted
    rural women powerfully and almost succeeded in capturing some neglected areas of women's life in dull colour schemes.`}{" "}
        <br />{" "}
        {`Explored between different weaves and different stripes and checked
    patterns, and tried to capture the emotions of the painting using
    threads.`}
      </>
    ),
    body: <Work1 />,
    bookmarks: (
      <>
        <Mark to="#overview" title="Overview" />
        <Mark to="#colour_palette" title="Colour Palette" />
        <Mark to="#explorations" title="Explorations" />
        <Mark to="#swatch_1" title="Swatch 1" />
        <Mark to="#swatch_2" title="Swatch 2" />
        <Mark to="#swatch_3" title="Swatch 3" />
        <Mark to="#swatch_4" title="Swatch 4" />
        <Mark to="#swatch_5" title="Swatch 5" />
        <Mark to="#altogether" title="Altogether" />
      </>
    ),
  },

  {
    index: x - 8,
    img: "/images/works/colour_and_weave_effect/candweffect.webp",
    title: "Colour and Weave Effect",
    category: "Weave design",
    topimg: "/images/works/colour_and_weave_effect/candweffect.webp",
    bottomimg: "/images/works/colour_and_weave_effect/bottom_img.jpg",
    description:
      "Learned about Weaving Mechanisms and prepared looms for making samples. Explored how different weave structures combine with sequences of light and dark coloured warp and weft threads; to create unique patterns. ",
    body: <Work3 />,
    bookmarks: (
      <>
        <Mark to="#overview" title="Overview" />
        <Mark to="#swatch_1" title="Swatch 1" />
        <Mark to="#swatch_2" title="Swatch 2" />
        <Mark to="#swatch_3" title="Swatch 3" />
        <Mark to="#swatch_4" title="Swatch 4" />
        <Mark to="#altogether" title="Altogether" />
      </>
    ),
  },

  {
    index: x - 7,
    img: "/images/works/naturaldyes/natural_dyes_poster.webp",
    title: "Natural Dyes",
    category: "Sustainability",
    topimg: "/images/works/naturaldyes/natural_dyes_poster.webp",
    bottomimg: "/images/works/naturaldyes/bottom_img.jpg",
    description: (
      <>
        {
          "Replacing synthetic dyes with non-hazardous natural dyes is more a need than a trend. One must start appreciating the limited palette, weak colour fastness and high costs of naturally dyed products. "
        }
        <br></br>
        {'As a part of the "Application of Natural Dyes." module I,'}
        <br></br>
        {
          <ul>
            <li>
              Explored various plant-based colourant materials and obtained a
              spectrum of colours on cotton fabrics.
            </li>
            <li>
              Experimented with different mordants and observed how different
              mordants alter the shade or hue of the colourants.
            </li>
            <li>
              Studied the dyes' colour fastness properties to diverse physical
              conditions such as washing, sunlight, rubbing and bleaching.
            </li>
          </ul>
        }
      </>
    ),
    body: <Work2 />,
    bookmarks: (
      <>
        <Mark to="#overview" title="Overview" />
        <Mark to="#marigold" title="Marigold" />
        <Mark to="#turmeric" title="Turmeric" />
        <Mark to="#onion_skin" title="Onion Skin" />
        <Mark to="#indigo" title="Indigo" />
        <Mark to="#catechu" title="Catechu" />
        <Mark to="#tea" title="Tea" />
        <Mark to="#iron_rust_jaggery" title="Iron rust & jaggery" />
        <Mark to="#multicolour_prints" title="Multicolour Prints" />
      </>
    ),
  },

  {
    index: x - 6,
    img: "/images/works/crd/crd.webp",
    title: "Jamnagri Bandhani",
    category: "Craft Research",
    topimg: "/images/works/crd/crd.webp",
    bottomimg: "/images/works/crd/bottom_img.jpg",
    description:
      "Craft research document on Jamnagar's beautiful tie and dye craft, 'Bandhani'. Studied and documented the art with a team of six people. Lived among the artisans and observed their working process. Compiled observations into \"Bandhej- the knots of love\", a document with detailed research on the craft.",
    body: <Work4 />,
    bookmarks: (
      <>
        <Mark to="#overview" title="Overview" />
        <Mark to="#jamnagar" title="Jamnagar" />
        <Mark to="#bandhani" title="Bandhani" />
        <Mark to="#tools_raw_materials" title="Tools & Raw Materials" />
        <Mark to="#process" title="Process" />
        <Mark to="#motifs_colours" title="Motifs & Colours" />
        <Mark to="#artisan_profiles" title="Artisan Profiles" />
        <Mark to="#references" title="References" />
        <Mark to="#download_document" title="Download Document" />
      </>
    ),
  },

  {
    index: x - 5,
    img: "/images/works/digital_nature/digital_nature0.webp",
    title: "Digital Nature",
    category: "Print design",
    topimg: "/images/works/digital_nature/digital_nature.webp",
    bottomimg: "/images/works/digital_nature/digital_nature2.webp",
    description: (
      <>
        {
          "Selected a clothing brand of choice and designed prints for their apparel collection, referred to WGSN Fashion Forecast for the colour palette and design direction. For the final collection, selected silhouettes according to the brand and placed the prints over them."
        }{" "}
        <br></br>
        {
          "Got two of the final prints digitally printed on a fabric and then stitched garments out of it. "
        }
      </>
    ),
    body: <Work7 />,
    bookmarks: (
      <>
        <Mark to="#overview" title="Overview" />
        <Mark to="#brand" title="Brand" />
        <Mark to="#inspiration" title="Inspiration" />
        <Mark to="#initial_concepts" title="Initial Concepts" />
        <Mark to="#print1" title="Print 1" />
        <Mark to="#print2" title="Print 2" />
        <Mark to="#print3" title="Print 3" />
        <Mark to="#print4" title="Print 4" />
        <Mark to="#print5" title="Print 5" />
        <Mark to="#print6" title="Print 6" />
        <Mark to="#print7" title="Print 7" />
        <Mark to="#final_collection" title="Final Collection" />
      </>
    ),
  },

  {
    index: x - 4,
    img: "/images/works/lounge_prints/lounge_print.webp",
    title: "Dreamy Skies",
    category: "Print Design",
    topimg: "/images/works/lounge_prints/lounge_print.webp",
    bottomimg: "/images/works/lounge_prints/bottom_image.jpg",
    description:
      "Created this print design collection under an export house, RGC Inc., for a Chilean brand, Lounge, as a classroom project. Designed prints for their spring-summer 2023 beachwear collection.",
    body: <Work5 />,
    bookmarks: (
      <>
        <Mark to="#overview" title="Overview" />
        <Mark to="#inspiration" title="Inspiration" />
        <Mark to="#print1" title="Print 1" />
        <Mark to="#print2" title="Print 2" />
        <Mark to="#print3" title="Print 3" />
        <Mark to="#print4" title="Print 4" />
        <Mark to="#print5" title="Print 5" />
        <Mark to="#print6" title="Print 6" />
        <Mark to="#print7" title="Print 7" />
        <Mark to="#collection" title="Collection" />
      </>
    ),
  },

  {
    index: x - 3,
    img: "/images/works/dyeing_techniques/dyeing_techniques.webp",
    title: "Fabric Dyeing Techniques",
    category: "Dyeing",
    topimg: "/images/works/dyeing_techniques/dyeing_techniques.webp",
    bottomimg: "/images/works/dyeing_techniques/two (5).jpg",
    description:
      "Explored various dyeing techniques like Tie-dye, Resist Dyeing (Wax, Stitch and Mud) and Synthetic Dyestuff like Acid, VAT, Direct, Reactive and Sulphur dyes. ",
    body: <Work6 />,
    bookmarks: (
      <>
        <Mark to="#overview" title="Overview" />
        <Mark to="#tiedye" title="Tie-Dye" />
        <Mark to="#resistdye" title="Resist Dyeing" />
        <Mark to="#bloomingbatik" title="Blooming Batik" />
        <Mark to="#syntheticdyes" title="Synthetic Dyes" />
      </>
    ),
  },

  // {
  //   index: 8,
  //   img: "/images/works/ecoprinting/ecoprint.webp",
  //   title: "Eco-printing",
  //   category: "Sustainability",
  //   topimg: "/images/works/ecoprinting/ecoprint.webp",
  //   bottomimg: "/images/works/digital_nature/digital_nature2.webp",
  //   description:
  //     "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean pulvinar metus quis bibendum cursus. Sed lectus dui, scelerisque viverra arcu eu, rhoncus rhoncus odio. Maecenas nec convallis sapien. Nullam volutpat feugiat eros. Phasellus imperdiet ut augue quis pellentesque. Duis tincidunt, arcu vestibulum convallis egestas, nisl sem aliquet lorem, eu lacinia nibh lacus non justo. Duis sagittis lobortis magna a dignissim. Sed posuere suscipit velit, a rhoncus justo ornare in. Etiam faucibus vel arcu viverra sodales. Quisque mattis condimentum est, in luctus metus suscipit fringilla. Donec malesuada urna ac sapien congue dapibus.",
  //   body: <Work1 />,
  //   bookmarks: (
  //     <>
  //       <Mark to="#marks" title="Course overview" />
  //       <Mark to="#markks" title="Course summary" />
  //     </>
  //   ),
  // },

  {
    index: x - 2,
    img: "/images/works/boro/topimg.jpg",
    title: "Boro-Textile from Japan",
    category: "Patchwork",
    topimg: "/images/works/boro/topimg.jpg",
    bottomimg: "/images/works/boro/swatch1.webp",
    description:
      'Textile, from Japan\'s northernmost island, developed out of the necessity of poor farmers who wanted to protect their bodies from the extreme cold. They patched layers and layers of torn fabric together to make a thick layer. Taking inspiration from the "Mending is the way." sustainability trend, I made patchwork swatches using waste fabric pieces. Explored various abstract compositions, stitched them on a sewing machine, and finally, made a tote bag using those swatches.',
    body: <Work11 />,
    bookmarks: (
      <>
        <Mark to="#overview" title="Overview" />
        <Mark to="#swatches" title="Swatches" />
        <Mark to="#productmapping" title="Product Mapping" />
        <Mark to="#totebag" title="Tote Bag" />
      </>
    ),
  },

  {
    index: x - 1,
    img: "/images/works/fineart/topimg.webp",
    title: "Artworks-Hand and Digital",
    category: "Artworks",
    topimg: "/images/works/fineart/topimg.webp",
    bottomimg: "/images/works/fineart/bottomimg.webp",
    description:
      "Here are a few artworks that I made. I used photoshop for the digital ones and the little animations.",
    body: <Work9 />,
    bookmarks: (
      <>
        <Mark to="#overview" title="Overview" />
        <Mark to="#artworks" title="Artworks" />
        <Mark to="#digital" title="Digital" />
        <Mark to="#animation" title="Animation" />
      </>
    ),
  },
];
