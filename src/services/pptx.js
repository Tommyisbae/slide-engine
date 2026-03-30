import pptxgen from "pptxgenjs";

export async function createUniversalDeck(deckData) {
    let pres = new pptxgen();

    // Title Slide
    let titleSlide = pres.addSlide();
    titleSlide.addText(deckData.presentation_title, {
        x: 0.5, y: 2.5, w: 9, h: 1.5, fontSize: 44, bold: true, align: "center"
    });

    // Content Slides
    deckData.slides.forEach((slideInfo) => {
        let slide = pres.addSlide();

        // Add Slide Title
        slide.addText(slideInfo.slide_title, {
            x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, bold: true
        });

        // Add whatever content the user dictated
        slide.addText(
            slideInfo.content_lines.map(line => ({ text: line })),
            { x: 0.5, y: 1.8, w: 9, h: 3.5, fontSize: 22, bullet: true, valign: "top" }
        );
    });

    await pres.writeFile({ fileName: `${deckData.presentation_title.replace(/\s+/g, '_')}.pptx` });
}
