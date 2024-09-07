import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Experience = () => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>
          <h2 className="text-3xl font-semibold tracking-tight">Experience</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              Software Development Engineer
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upside Down Labs | 3 Jun 2024 - 3 Aug 2024 | New Delhi, IN
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Developed a full-stack Signal Visualizer web app using Next.js
                and Django for real-time biopotential signal analysis (EMG, ECG,
                EEG and EOG).
              </li>
              <li>
                Implemented WebSocket communication, Serial port connection and
                automatic port detection via pyserial.
              </li>
              <li>
                Created advanced features including multi-channel real-time
                plotting, FFT analysis, EEG band power visualization, and raw
                csv data export functionality.
              </li>
            </ul>
          </div>
          <Separator />
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              Python Developer
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Brain Intel Corp | 1 Jun 2023 - 31 Jul 2023 | New Delhi, IN
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Engineered a neural network model for voice-based emotion
                detection, achieving 85% accuracy using CNN and transfer
                learning techniques.
              </li>
              <li>
                Implemented feature extraction and model training using
                open-source datasets from Kaggle.
              </li>
              <li>
                Utilized Python ecosystem including Librosa, scikit-learn,
                Keras, and TensorFlow for efficient development and
                experimentation.
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Experience;
