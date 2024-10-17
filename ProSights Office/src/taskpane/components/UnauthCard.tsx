import * as React from "react";
import { Card, CardFooter, CardPreview, Text, Button } from "@fluentui/react-components";

interface UnauthenticatedCardProps {
  login: () => void;
  signup: () => void;
}

export const UnauthenticatedCard: React.FC<UnauthenticatedCardProps> = ({ login, signup }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-1">
      <Card size="large" className="w-full" appearance="filled">
        <CardPreview>
          <Text size={400} align="center">
            ProSights
          </Text>
        </CardPreview>
        <CardFooter className="flex justify-center gap-2">
          <Button disabled onClick={signup}>
            Signup
          </Button>
          <Button onClick={login}>Login</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
