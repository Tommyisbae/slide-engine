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

        // 1. Add Slide Title
        slide.addText(slideInfo.slide_title, {
            x: 0.5, y: 0.4, w: 9, h: 1, fontSize: 28, bold: true, color: "363636"
        });

        // 2. THE FORMATTING FIX: 
        // Prepare the text array. We also add a tiny regex replace just in case 
        // the AI forgets to put a space after a period (like "complications.SAM")
        const formattedBullets = slideInfo.content_lines.map(line => {
            // Cleans up missing spaces after periods: "word.Word" -> "word. Word"
            const cleanedLine = line.replace(/\.([A-Z])/g, '. $1').trim();

            return {
                text: cleanedLine,
                options: {
                    breakLine: true // Forces a hard "Enter" after every single array item
                }
            };
        });

        // 3. Render the text with built-in breathing room
        slide.addText(formattedBullets, {
            x: 0.5,
            y: 1.5,
            w: 9,
            h: 3.8,
            fontSize: 16,        // Dropped font size slightly to fit heavy academic context
            bullet: true,        // Adds the actual bullet point marker
            valign: "top",       // Aligns text to the top so it doesn't float weirdly
            paraSpaceAfter: 12   // MAGIC PROPERTY: Adds vertical blank space between each point
        });
    });

    await pres.writeFile({ fileName: `${deckData.presentation_title.replace(/\s+/g, '_')}.pptx` });
}
