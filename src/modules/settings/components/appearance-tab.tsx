"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function AppearanceTab() {
	const { theme, setTheme } = useTheme();

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Theme</CardTitle>
					<CardDescription>
						Select the theme for the application interface
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<RadioGroup value={theme} onValueChange={setTheme}>
						<div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
							<RadioGroupItem value="light" id="light" />
							<Label htmlFor="light" className="flex-1 cursor-pointer">
								<div className="flex items-center space-x-3">
									<Sun className="h-5 w-5 text-muted-foreground" />
									<div>
										<div className="font-medium">Light</div>
										<div className="text-sm text-muted-foreground">
											Light theme with bright backgrounds
										</div>
									</div>
								</div>
							</Label>
						</div>

						<div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
							<RadioGroupItem value="dark" id="dark" />
							<Label htmlFor="dark" className="flex-1 cursor-pointer">
								<div className="flex items-center space-x-3">
									<Moon className="h-5 w-5 text-muted-foreground" />
									<div>
										<div className="font-medium">Dark</div>
										<div className="text-sm text-muted-foreground">
											Dark theme with darker backgrounds
										</div>
									</div>
								</div>
							</Label>
						</div>

						<div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
							<RadioGroupItem value="system" id="system" />
							<Label htmlFor="system" className="flex-1 cursor-pointer">
								<div className="flex items-center space-x-3">
									<Monitor className="h-5 w-5 text-muted-foreground" />
									<div>
										<div className="font-medium">System</div>
										<div className="text-sm text-muted-foreground">
											Use system preference (auto-switch based on OS settings)
										</div>
									</div>
								</div>
							</Label>
						</div>
					</RadioGroup>
				</CardContent>
			</Card>
		</div>
	);
}
